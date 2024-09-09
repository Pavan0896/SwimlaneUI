import { Box, IconButton, HStack } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

const Column = ({
  status,
  title,
  items,
  onDragStart,
  onDrop,
  onTaskClick,
  openEditModal,
  openDeleteModal,
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropInColumn = () => {
    onDrop(status);
  };

  return (
    <Box
      width="350px"
      minHeight="400px"
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="lg"
      onDragOver={handleDragOver}
      onDrop={handleDropInColumn}
      transition="0.2s ease"
      _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
    >
      <Box
        bg={title.bgColor}
        p={3}
        mb={4}
        borderRadius="md"
        color="white"
        fontWeight="bold"
        textAlign="center"
      >
        {title.text}
      </Box>

      {items.map((item) => (
        <Box
          key={item.id}
          bg="gray.50"
          p={3}
          mb={3}
          borderRadius="md"
          boxShadow="sm"
          draggable
          onDragStart={() => onDragStart(item)}
          onClick={() => onTaskClick(item)}
          cursor="pointer"
          transition="0.2s ease"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "md",
            bg: "gray.100",
          }}
        >
          <HStack justify="space-between">
            <Box>{item.title}</Box>

            <HStack spacing={2}>
              <IconButton
                aria-label="Edit task"
                icon={<EditIcon />}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); 
                  openEditModal(item); 
                }}
              />
              <IconButton
                aria-label="Delete task"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation(); 
                  openDeleteModal(item);
                }}
              />
            </HStack>
          </HStack>
        </Box>
      ))}
    </Box>
  );
};

export default Column;
