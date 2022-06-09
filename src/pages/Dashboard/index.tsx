import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import api from "../../services/api";
import { Food } from "../../components/Food";
import { ModalAddFood } from "../../components/ModalAddFood";
import { ModalEditFood } from "../../components/ModalEditFood";
import { FoodsContainer } from "./styles";
import { FoodModel } from "../../@types/food.model";

/**
 * Componente para pagina principal da aplicação
 * @returns
 */
export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [foods, setFoods] = useState<FoodModel[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodModel | null>(null);

  useEffect(() => {
    api.get("/foods").then((response) => {
      setFoods(response.data);
    });
  }, []);

  async function handleAddFood(food: FoodModel) {
    try {
      const response = await api.post<FoodModel>("/foods", {
        ...food,
        available: true,
      });

      setFoods((curr) => {
        return [...curr, response.data];
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateFood(food: FoodModel) {
    if (!editingFood) {
      return;
    }

    try {
      const foodUpdated = await api.put(`/foods/${editingFood.id}`, {
        ...editingFood,
        ...food,
      });

      const foodsUpdated = foods.map((f) =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.error(err);
    }
  }

  function handleEditFood(food: FoodModel) {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  async function handleDeleteFood(id: number) {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter((food) => food.id !== id);

    setFoods(foodsFiltered);
  }

  function toggleModal() {
    setModalOpen((curr) => !curr);
  }

  function toggleEditModal() {
    setEditModalOpen((curr) => !curr);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      {editingFood && (
        <ModalEditFood
          isOpen={editModalOpen}
          setIsOpen={toggleEditModal}
          editingFood={editingFood}
          handleUpdateFood={handleUpdateFood}
        />
      )}

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map((food) => (
            <Food
              food={food}
              key={food.id}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}
