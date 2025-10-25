import { FC, useState } from "react";
import ModalPopup from "../EditProfilePopup"
import { ApiUser } from "@/lib/api";

type UserCardProps = {
  user: ApiUser;
  variant: "info" | "description" | "skills" | "photo";
  onUpdate?: (newText: string) => void;
};

const UserCard: FC<UserCardProps> = ({ user, variant, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editText, setEditText] = useState(user.bio);

  const fullName = `${user.name} (${user.age} лет)`;

  const handleEditClick = () => {
    if (variant === "photo") return;
    setEditText(user.bio);
    setIsModalOpen(true);
  };

  const handleEditSubmit = (newText: string) => {
    if (onUpdate) onUpdate(newText);
    setIsModalOpen(false);
  };

  switch (variant) {
    case "info":
      return (
        <>
          <div className="card-base cursor-pointer p-4" onClick={handleEditClick}>
            <h2 className="text-lg font-semibold text-accent">{fullName}</h2>
          </div>
          <ModalPopup
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleEditSubmit}
            title="Редактировать ФИО и возраст"
            placeholder="Введите новое ФИО или возраст"
            initialText={editText}
          />
        </>
      );
    case "description":
      return (
        <>
          <div className="card-base cursor-pointer p-4 min-h-[20vh]" onClick={handleEditClick}>
            <h3 className="text-lg font-semibold mb-2 text-accent">О себе</h3>
            <p className="text-gray-300">{user.bio || "Нет описания"}</p>
          </div>
          <ModalPopup
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleEditSubmit}
            title="Редактировать биографию"
            placeholder="Введите новое описание"
            initialText={editText}
          />
        </>
      );
    case "skills":
      return (
        <>
          <div className="card-base cursor-pointer p-4 min-h-[15vh]" onClick={handleEditClick}>
            <h3 className="text-lg font-semibold mb-2 text-accent">Навыки</h3>
            <p className="text-gray-300">{user.bio || "Нет навыков"}</p>
          </div>
          <ModalPopup
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleEditSubmit}
            title="Редактировать навыки"
            placeholder="Введите навыки через запятую"
            initialText={editText}
          />
        </>
      );
    case "photo":
      return (
        <div className="card-base p-4 flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-gray-300">Фото</span>
          </div>
          <h3 className="mt-3 text-lg font-medium text-accent">{user.name}</h3>
        </div>
      );
    default:
      return null;
  }
};

export default UserCard;
