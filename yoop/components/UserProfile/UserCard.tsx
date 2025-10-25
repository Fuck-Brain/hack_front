import { FC, useMemo, useState } from "react";
import ModalPopup from "../EditProfilePopup";
import { ApiUser } from "@/lib/api";

type UserCardProps = {
  user: ApiUser;
  variant: "info" | "description" | "skills" | "photo";
  onUpdate?: (changes: Partial<ApiUser>) => void;
};

const UserCard: FC<UserCardProps> = ({ user, variant, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editText, setEditText] = useState("");

  const initialText = useMemo(() => {
    switch (variant) {
      case "info":
        {
          const fio = [user.surName, user.name, user.fatherName]
            .filter(Boolean)
            .join(" ");
          const ageText = user.age ? `, ${user.age}` : "";
          return `${fio}${ageText}`.trim();
        }
      case "description":
        return user.describeUser ?? "";
      case "skills":
        return (user.skills ?? []).join(", ");
      default:
        return "";
    }
  }, [variant, user]);

  const fullName = useMemo(() => {
    const fio = [user.surName, user.name, user.fatherName]
      .filter(Boolean)
      .join(" ");
    return fio || user.name || user.login || "Без имени";
  }, [user]);

  const handleEditClick = () => {
    if (variant === "photo") return;
    setEditText(initialText);
    setIsModalOpen(true);
  };

  const handleEditSubmit = (newText: string) => {
    if (!onUpdate) {
      setIsModalOpen(false);
      return;
    }

    if (variant === "info") {
      const [fioPart, agePart] = newText.split(",");
      const fioPieces = fioPart ? fioPart.trim().split(/\s+/).filter(Boolean) : [];
      const next: Partial<ApiUser> = {};
      if (fioPieces.length >= 2) {
        const [surName, name, ...rest] = fioPieces;
        const fatherName = rest.join(" ");
        next.surName = surName;
        next.name = name;
        if (fatherName) next.fatherName = fatherName;
      }
      const parsedAge = agePart ? Number.parseInt(agePart.trim(), 10) : NaN;
      if (!Number.isNaN(parsedAge)) {
        next.age = parsedAge;
      }
      if (Object.keys(next).length > 0) {
        onUpdate(next);
      }
    } else if (variant === "description") {
      onUpdate({ describeUser: newText.trim() });
    } else if (variant === "skills") {
      const skills = newText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      onUpdate({ skills });
    }
    setIsModalOpen(false);
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
            onSubmit={handleEditSubmit}
            title="Редактировать ФИО и возраст"
            placeholder="Фамилия Имя Отчество, возраст"
            value={editText}
            onChange={setEditText}
          />
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
            onSubmit={handleEditSubmit}
            title="Редактировать биографию"
            placeholder="Введите новое описание"
            value={editText}
            onChange={setEditText}
          />
        </>
      );
    case "skills":
      return (
        <>
          <div className="card-base cursor-pointer p-4 min-h-[15vh]" onClick={handleEditClick}>
            <h3 className="text-lg font-semibold mb-2 text-accent">Навыки</h3>
            <p className="text-gray-300">
              {(user.skills && user.skills.length > 0
                ? user.skills.join(", ")
                : "Нет навыков")}
            </p>
          </div>
          <ModalPopup
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleEditSubmit}
            title="Редактировать навыки"
            placeholder="Введите навыки через запятую"
            value={editText}
            onChange={setEditText}
          />
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
