const slots = ["cherry", "plum", "orange", "lemon", "bar"];

// Get random in range
function getRandomRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

const getRandomSlot = (start = 0) => {
  return slots[getRandomRange(start, slots.length)];
};

const getRandomSlots = () => {
  return [getRandomSlot(0), getRandomSlot(0), getRandomSlot(1)];
};

module.exports = {
  getRandomSlots,
};
