import {
  Box,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input as ChakraInput,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Column from "./Column";
import axios from "axios";

const SwimlaneBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [taskHistory, setTaskHistory] = useState([]);
  const [formData, setFormData] = useState({ title: "", additionalInfo: "" });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const url = import.meta.env.VITE_BACKEND_URL;

  const {
    isOpen: isOpenAdditionalInfo,
    onOpen: onOpenAdditionalInfo,
    onClose: onCloseAdditionalInfo,
  } = useDisclosure();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await axios.get(`${url}/api/tasks`);
    setTasks(response.data);
    setFilteredTasks(response.data);
  };

  const fetchTaskHistory = async (title) => {
    try {
      if (!title) return;

      const response = await axios.get(`${url}/api/task-history/${title}`);
      setTaskHistory(response.data);
    } catch (error) {
      console.error(
        "Error fetching task history:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask({ ...task, originalStatus: task.status });
  };

  const handleDrop = async (targetStatus) => {
    if (!draggedTask) return;

    setNewStatus(targetStatus);
    onOpenAdditionalInfo();
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskHistory([]);
    fetchTaskHistory(task.title);
    openHistoryModal();
  };

  const handleFilterChange = (e) => {
    const filterText = e.target.value.toLowerCase();
    const filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(filterText) ||
        task.status.toLowerCase().includes(filterText)
    );
    setFilteredTasks(filtered);
  };

  const handleModalSubmit = async () => {
    if (!draggedTask || !newStatus) return;

    const updatedTask = { ...draggedTask, status: newStatus };
    await axios.put(`${url}/api/tasks/${draggedTask._id}`, updatedTask);

    const updatedTasks = tasks.map((t) =>
      t._id === draggedTask._id ? updatedTask : t
    );

    const newHistoryEntry = {
      task: draggedTask.title,
      from: draggedTask.status,
      to: newStatus,
      date: new Date().toISOString(),
      additionalInfo: formData.additionalInfo,
    };

    await axios.post(`${url}/api/task-history`, newHistoryEntry);

    await fetchTaskHistory(draggedTask.title);

    await fetchTasks();

    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    onCloseAdditionalInfo();
    setDraggedTask(null);
    setNewStatus("");
    setFormData({ title: "", additionalInfo: "" });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTask = async () => {
    const newTask = { title: formData.title, status: "to-do" };
    const response = await axios.post(`${url}/api/tasks`, newTask);
    setTasks([...tasks, response.data]);
    setFilteredTasks([...tasks, response.data]);
    setFormData({ title: "", additionalInfo: "" });
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setFormData({ title: task.title });
    setIsEditModalOpen(true);
  };

  const saveEditedTask = async () => {
    if (!selectedTask || !formData.title) return;

    const updatedTask = { ...selectedTask, title: formData.title };
    await axios.put(`${url}/api/tasks/${selectedTask._id}`, updatedTask);

    const updatedTasks = tasks.map((t) =>
      t._id === selectedTask._id ? updatedTask : t
    );
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    setIsEditModalOpen(false);
    setSelectedTask(null);
    setFormData({ title: "", additionalInfo: "" });
  };

  const handleDeleteTask = async () => {
    await axios.delete(`${url}/api/tasks/${selectedTask._id}`);
    const updatedTasks = tasks.filter((t) => t._id !== selectedTask._id);
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    setIsDeleteModalOpen(false);
    setSelectedTask(null);
  };

  const openDeleteModal = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const openHistoryModal = () => {
    setIsHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  return (
    <Box p={5} maxW="1200px" mx="auto">
      <Input
        placeholder="Filter tasks by title or status"
        mb={5}
        size="lg"
        bg="white"
        boxShadow="md"
        onChange={handleFilterChange}
      />

      <Box
        display="flex"
        justifyContent="space-evenly"
        gap={2}
        flexWrap="wrap"
        p={5}
        bg="gray.100"
        borderRadius="md"
        boxShadow="lg"
      >
        <Column
          status="to-do"
          title={{ text: "To Do", bgColor: "#fc7f03" }}
          items={filteredTasks.filter((e) => e.status === "to-do")}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
          openEditModal={handleEditTask}
          openDeleteModal={openDeleteModal}
          openHistoryModal={openHistoryModal}
        />
        <Column
          status="in-progress"
          title={{ text: "In Progress", bgColor: "#03fcba" }}
          items={filteredTasks.filter((e) => e.status === "in-progress")}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
          openEditModal={handleEditTask}
          openDeleteModal={openDeleteModal}
          openHistoryModal={openHistoryModal}
        />
        <Column
          status="done"
          title={{ text: "Done", bgColor: "#03fc07" }}
          items={filteredTasks.filter((e) => e.status === "done")}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
          openEditModal={handleEditTask}
          openDeleteModal={openDeleteModal}
          openHistoryModal={openHistoryModal}
        />
      </Box>

      <Box mt={5}>
        <ChakraInput
          name="title"
          placeholder="Add new task"
          value={formData.title}
          onChange={handleInputChange}
        />
        <Button onClick={handleAddTask} colorScheme="blue" ml={3}>
          Add Task
        </Button>
      </Box>

      {/* Modal for Additional Information */}
      <Modal isOpen={isOpenAdditionalInfo} onClose={onCloseAdditionalInfo}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Provide Additional Information</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Additional Information</FormLabel>
              <ChakraInput
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                placeholder="Enter additional details here"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleModalSubmit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Editing Tasks */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Task</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <ChakraInput
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Edit task title"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={saveEditedTask}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Deleting Tasks */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Task</ModalHeader>
          <ModalBody>Are you sure you want to delete this task?</ModalBody>
          <ModalFooter>
            <Button colorScheme="red" onClick={handleDeleteTask}>
              Delete
            </Button>
            <Button ml={3} onClick={closeDeleteModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Task History */}
      <Modal isOpen={isHistoryModalOpen} onClose={closeHistoryModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Task History</ModalHeader>
          <ModalBody>
            {taskHistory.length > 0 ? (
              taskHistory.map((entry, index) => (
                <Box key={index} mb={3}>
                  <strong>{entry.task}</strong>: {entry.from} → {entry.to}{" "}
                  <br />
                  <em>Date:</em> {new Date(entry.date).toLocaleDateString()}{" "}
                  <br />
                  <em>Additional Info:</em> {entry.additionalInfo}
                </Box>
              ))
            ) : (
              <Box>No history of the task</Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeHistoryModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SwimlaneBoard;
