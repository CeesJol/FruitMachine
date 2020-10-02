const SLOTS = ["cherry", "plum", "orange", "lemon", "bar"];
const COIN_INPUT = 5;
const DAILY_COINS = 50;

// Get random in range
const getRandomRange = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const getVariation = (base, variations) => {
  return base + getRandomRange(1, 1 + variations);
};

const getRandomSlot = (start = 0) => {
  return SLOTS[getRandomRange(start, SLOTS.length)];
};

/**
 * Generate 3 random slots
 */
const getRandomSlots = () => {
  return [getRandomSlot(0), getRandomSlot(0), getRandomSlot(1)];
};

/**
 * Get reward based on slots
 */
const getReward = (slots = ["", "", ""]) => {
  let reward = {
    message: "",
    reward: 0,
  };

  if (slots[0] === "cherry" && slots[1] === "cherry") {
    reward = {
      message: "cherry, cherry, any",
      reward: 2 * COIN_INPUT,
    };
  } else if (slots[0] === "cherry") {
    reward = {
      message: "cherry, any, any",
      reward: 1 * COIN_INPUT,
    };
  }

  if (slots[0] === slots[1] && slots[1] === slots[2]) {
    reward = {
      message: `triple ${slots[0]}`,
      reward: 10 * COIN_INPUT,
    };
  }

  return reward;
};

/**
 * Return a sloppy date format
 */
const getDate = () => {
  const d = new Date();
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
};

/**
 * Check if user opens skill on a new day
 * This means they should get their daily reward
 */
const isNewDay = (date) => {
  return date !== getDate();
};

module.exports = {
  COIN_INPUT,
  DAILY_COINS,
  getRandomSlots,
  getReward,
  getVariation,
  isNewDay,
  getDate,
};
