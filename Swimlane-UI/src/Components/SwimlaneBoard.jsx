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
import { useState } from "react";
import Column from "./Column";
import tasksData from "../tasks";

const taskTransitionRules = {
  "to-do": ["in-progress"],
  "in-progress": ["done"],
  done: [],
};

const SwimlaneBoard = () => {
  const [tasks, setTasks] = useState(tasksData);
  const [filteredTasks, setFilteredTasks] = useState(tasksData);
  const [draggedTask, setDraggedTask] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [taskHistory, setTaskHistory] = useState([]);
  const [formData, setFormData] = useState({ additionalInfo: "" });
  const {
    isOpen: isOpenAdditionalInfo,
    onOpen: onOpenAdditionalInfo,
    onClose: onCloseAdditionalInfo,
  } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState(null);

  const handleDragStart = (task) => {
    setDraggedTask({ ...task, originalStatus: task.status });
  };

  const handleDrop = (targetStatus) => {
    if (!draggedTask) return;

    const allowedTransitions = taskTransitionRules[draggedTask.status];
    if (!allowedTransitions.includes(targetStatus)) {
      setNewStatus(targetStatus);
      onOpenAdditionalInfo();
      return;
    }

    const updatedHistory = [
      ...taskHistory,
      {
        task: draggedTask.title,
        from: draggedTask.status,
        to: targetStatus,
        date: new Date().toISOString(),
      },
    ];

    const updatedTasks = tasks.map((t) =>
      t.title === draggedTask.title ? { ...t, status: targetStatus } : t
    );
    setTaskHistory(updatedHistory);
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    setDraggedTask(null);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    onOpen();
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

  const handleModalSubmit = () => {
    if (!draggedTask || !newStatus) return;

    const updatedTasks = tasks.map((t) =>
      t.title === draggedTask.title
        ? { ...t, status: newStatus, ...formData }
        : t
    );

    const updatedHistory = [
      ...taskHistory,
      {
        task: draggedTask.title,
        from: draggedTask.status,
        to: newStatus,
        date: new Date().toISOString(),
      },
    ];

    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    setTaskHistory(updatedHistory);
    onCloseAdditionalInfo();
    setDraggedTask(null);
    setNewStatus("");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        />
        <Column
          status="in-progress"
          title={{ text: "In Progress", bgColor: "#03fcba" }}
          items={filteredTasks.filter((e) => e.status === "in-progress")}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
        />
        <Column
          status="done"
          title={{ text: "Done", bgColor: "#03fc07" }}
          items={filteredTasks.filter((e) => e.status === "done")}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onTaskClick={handleTaskClick}
        />
      </Box>

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
              Submit
            </Button>
            <Button variant="ghost" onClick={onCloseAdditionalInfo}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Task History for {selectedTask?.title}</ModalHeader>
          <ModalBody>
            {taskHistory
              .filter((entry) => entry.task === selectedTask?.title)
              .map((entry, index) => (
                <Box key={index} mb={2}>
                  Moved from <strong>{entry.from}</strong> to{" "}
                  <strong>{entry.to}</strong> on{" "}
                  <strong>{new Date(entry.date).toLocaleString()}</strong>
                </Box>
              ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SwimlaneBoard;
