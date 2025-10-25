import { FC, useMemo, useState } from "react";
import ModalPopup from "../EditProfilePopup";
import { ApiUser } from "@/lib/api";

type UserCardProps = {
  user: ApiUser;
  variant: "info" | "description" | "skills" | "photo";
  onUpdate?: (changes: Partial<ApiUser>) => void;
};

type ListField = "skills" | "interests" | "hobbies";

type ListDraftState = Record<ListField, string[]>;

type ListInputState = Record<ListField, string>;

const createEmptyLists = (): ListDraftState => ({
  skills: [],
  interests: [],
  hobbies: [],
});

const createEmptyInputs = (): ListInputState => ({
  skills: "",
  interests: "",
  hobbies: "",
});

const UserCard: FC<UserCardProps> = ({ user, variant, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoDraft, setInfoDraft] = useState({
    surName: "",
    name: "",
    fatherName: "",
    age: "",
  });
  const [textDraft, setTextDraft] = useState("");
  const [listDraft, setListDraft] = useState<ListDraftState>(() => createEmptyLists());
  const [listInputs, setListInputs] = useState<ListInputState>(() => createEmptyInputs());

  const fullName = useMemo(() => {
    const fio = [user.surName, user.name, user.fatherName]
      .filter(Boolean)
      .join(" ");
    return fio || user.name || user.login || "Без имени";
  }, [user]);

  const handleEditClick = () => {
    if (variant === "photo") return;
    if (variant === "info") {
      setInfoDraft({
        surName: user.surName ?? "",
        name: user.name ?? "",
        fatherName: user.fatherName ?? "",
        age: user.age ? String(user.age) : "",
      });
    } else if (variant === "description") {
      setTextDraft(user.describeUser ?? "");
    } else if (variant === "skills") {
      setListDraft({
        skills: [...(user.skills ?? [])],
        interests: [...(user.interests ?? [])],
        hobbies: [...(user.hobbies ?? [])],
      });
      setListInputs(createEmptyInputs());
    }
    setIsModalOpen(true);
  };

  const infoSubmitDisabled = useMemo(() => {
    if (variant !== "info") return false;
    return !infoDraft.name.trim() || !infoDraft.surName.trim();
  }, [infoDraft.name, infoDraft.surName, variant]);

  const handleInfoSubmit = () => {
    if (!onUpdate) return;

    const payload: Partial<ApiUser> = {
      name: infoDraft.name.trim(),
      surName: infoDraft.surName.trim(),
      fatherName: infoDraft.fatherName.trim(),
    };

    const parsedAge = Number.parseInt(infoDraft.age.trim(), 10);
    if (!Number.isNaN(parsedAge)) {
      payload.age = parsedAge;
    }

    onUpdate(payload);
    setIsModalOpen(false);
  };

  const handleDescriptionSubmit = () => {
    if (!onUpdate) return;
    onUpdate({ describeUser: textDraft.trim() });
    setIsModalOpen(false);
  };

  const handleListSubmit = () => {
    if (!onUpdate) return;
    onUpdate({
      skills: [...listDraft.skills],
      interests: [...listDraft.interests],
      hobbies: [...listDraft.hobbies],
    });
    setIsModalOpen(false);
  };

  const handleInputChange = (field: ListField, value: string) => {
    setListInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = (field: ListField) => {
    const value = listInputs[field].trim();
    if (!value) return;
    setListDraft((prev) => {
      const existing = prev[field];
      if (existing.some((item) => item.toLowerCase() === value.toLowerCase())) {
        return prev;
      }
      return { ...prev, [field]: [...existing, value] };
    });
    setListInputs((prev) => ({ ...prev, [field]: "" }));
  };

  const handleRemoveItem = (field: ListField, index: number) => {
    setListDraft((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const renderTagList = (
    title: string,
    field: ListField,
    items: string[],
    placeholder: string
  ) => (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="font-medium text-sm text-gray-200 sm:w-32">
          {title}
        </label>
        <div className="flex-1 flex flex-col gap-2 sm:flex-row">
          <input
            value={listInputs[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddItem(field);
              }
            }}
            placeholder={placeholder}
            className="flex-1 rounded-md border border-gray-600 bg-[#1c1c1c] px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => handleAddItem(field)}
            className="px-3 py-2 text-sm rounded-md bg-accent text-black font-semibold hover:opacity-90 transition"
          >
            Добавить
          </button>
        </div>
      </div>
      {items.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <li
              key={`${field}-${item}-${index}`}
              className="group flex items-center gap-2 rounded-full bg-gray-700/70 px-3 py-1 text-sm"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(field, index)}
                className="text-xs text-red-300 transition-colors hover:text-red-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">Нет элементов</p>
      )}
    </div>
  );

  const renderListSection = () => (
    <div className="space-y-6">
      {renderTagList("Навыки", "skills", listDraft.skills, "Добавьте навык")}
      {renderTagList("Интересы", "interests", listDraft.interests, "Добавьте интерес")}
      {renderTagList("Хобби", "hobbies", listDraft.hobbies, "Добавьте хобби")}
    </div>
  );

  const renderListPreview = () => {
    const sections: Array<{ title: string; items: string[] }> = [
      { title: "Навыки", items: user.skills ?? [] },
      { title: "Интересы", items: user.interests ?? [] },
      { title: "Хобби", items: user.hobbies ?? [] },
    ];

    return (
      <div className="space-y-4">
        {sections.map(({ title, items }) => (
          <div key={title}>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-accent/80">
              {title}
            </h4>
            {items.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2 text-sm text-gray-100">
                {items.map((item) => (
                  <li
                    key={`${title}-${item}`}
                    className="rounded-full bg-gray-700/70 px-3 py-1"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-400">Нет данных</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  switch (variant) {
    case "info":
      return (
        <>
          <div className="card-base cursor-pointer p-4" onClick={handleEditClick}>
            <h2 className="text-lg font-semibold text-accent">
              {fullName}
              {user.age ? ` (${user.age} лет)` : ""}
            </h2>
          </div>
          <ModalPopup
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleInfoSubmit}
            title="Редактировать ФИО и возраст"
            isSubmitDisabled={infoSubmitDisabled}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-gray-200">
                <span>Фамилия</span>
                <input
                  value={infoDraft.surName}
                  onChange={(e) =>
                    setInfoDraft((prev) => ({ ...prev, surName: e.target.value }))
                  }
                  className="rounded-md border border-gray-600 bg-[#1c1c1c] px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Введите фамилию"
                  autoFocus
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-gray-200">
                <span>Имя</span>
                <input
                  value={infoDraft.name}
                  onChange={(e) =>
                    setInfoDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="rounded-md border border-gray-600 bg-[#1c1c1c] px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Введите имя"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-gray-200">
                <span>Отчество</span>
                <input
                  value={infoDraft.fatherName}
                  onChange={(e) =>
                    setInfoDraft((prev) => ({ ...prev, fatherName: e.target.value }))
                  }
                  className="rounded-md border border-gray-600 bg-[#1c1c1c] px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Введите отчество"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-gray-200">
                <span>Возраст</span>
                <input
                  value={infoDraft.age}
                  onChange={(e) =>
                    setInfoDraft((prev) => ({ ...prev, age: e.target.value }))
                  }
                  className="rounded-md border border-gray-600 bg-[#1c1c1c] px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Например, 21"
                  inputMode="numeric"
                />
              </label>
            </div>
          </ModalPopup>
        </>
      );
    case "description":
      return (
        <>
          <div className="card-base cursor-pointer p-4 min-h-[20vh]" onClick={handleEditClick}>
            <h3 className="text-lg font-semibold mb-2 text-accent">О себе</h3>
            <p className="text-gray-300">
              {(user.describeUser && user.describeUser.trim()) || "Нет описания"}
            </p>
          </div>
          <ModalPopup
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleDescriptionSubmit}
            title="Редактировать биографию"
          >
            <label className="flex flex-col gap-2 text-sm text-gray-200">
              <span>О себе</span>
              <textarea
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
                placeholder="Введите новое описание"
                className="min-h-[200px] w-full rounded-md border border-gray-600 bg-[#1c1c1c] p-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
          </ModalPopup>
        </>
      );
    case "skills":
      return (
        <>
          <div
            className="card-base cursor-pointer p-4 min-h-[15vh] space-y-4"
            onClick={handleEditClick}
          >
            <h3 className="text-lg font-semibold text-accent">Навыки и интересы</h3>
            {renderListPreview()}
          </div>
          <ModalPopup
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleListSubmit}
            title="Редактировать навыки, интересы и хобби"
          >
            {renderListSection()}
          </ModalPopup>
        </>
      );
    case "photo":
      return (
        <div className="card-base p-4 flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-gray-300">Фото</span>
          </div>
          <h3 className="mt-3 text-lg font-medium text-accent">{fullName}</h3>
        </div>
      );
    default:
      return null;
  }
};

export default UserCard;
