const { DAILY_COINS } = require("./constants");

const SPIN_MESSAGE = `
	<audio src="soundbank://soundlibrary/cloth_leather_paper/money_coins/money_coins_03"/>
	You spinned: 
	<audio src="soundbank://soundlibrary/sports/tennis_pingpong/tennis_pingpong_10"/>
	%s 
	<break time="300ms"/>
	<audio src="soundbank://soundlibrary/sports/tennis_pingpong/tennis_pingpong_10"/>
	%s 
	<break time="300ms"/>
	<audio src="soundbank://soundlibrary/sports/tennis_pingpong/tennis_pingpong_10"/>
	%s. 
	<break time="300ms"/>`;

module.exports = {
  translation: {
    SKILL_NAME: "Fruit Machine",
    EXIT_MESSAGE: "Thanks for playing!",
    FALLBACK_MESSAGE: `I can't help you with that. Say spin to spin the machine.`,
    LAUNCH_MESSAGE:
      "Welcome to Fruit Machine. You have %s coins. Would you like to play?",
    LAUNCH_MESSAGE_FIRST_DAY:
      "Welcome to Fruit Machine. Say spin to insert 5 coins and spin the machine. If you make a combination, you win! You start with %s coins. Would you like to play?",
    LAUNCH_MESSAGE_NEW_DAY: `
			Welcome back to Fruit Machine. 
			<amazon:emotion name="excited" intensity="low">
			Your daily reward is ${DAILY_COINS} coins! 
			</amazon:emotion>
			You have %s coins. Would you like to play?`,
    CONTINUE_MESSAGE: "Say yes to play or no to quit.",
    HELP_MESSAGE:
      "Say spin to insert 5 coins and spin the machine. If you make a combination, you win!",
    ERROR_MESSAGE: "Sorry, an error occurred.",
    YES_MESSAGE: "Great! Try saying a number to start the game.",
    SPIN_MESSAGE_WIN: [
      `${SPIN_MESSAGE}
			<amazon:emotion name="excited" intensity="low">
			You won with combination: %s! You win %s coins! 
			</amazon:emotion>
			You have %s coins left. Would you like to spin again?`,
      `${SPIN_MESSAGE}
			<amazon:emotion name="excited" intensity="low">
			You spinned the winning combination %s, and won %s coins! 
			</amazon:emotion>
			You have %s coins left. Would you like to spin again?`,
    ],
    SPIN_MESSAGE_LOSE: [
      `${SPIN_MESSAGE}
			<amazon:emotion name="disappointed" intensity="medium">
			You lost! 
			</amazon:emotion>
			You have %s coins left. Would you like to spin again?`,
      `${SPIN_MESSAGE}
			<amazon:emotion name="disappointed" intensity="low">
			You lost, bringing you down to %s coins.
			</amazon:emotion>
			One more spin?`,
    ],
    NOT_ENOUGH_COINS: `
			<amazon:emotion name="disappointed" intensity="low">
			You don't have enough coins to spin anymore.
			</amazon:emotion>
			Come back tomorrow for 50 more coins!
		`,
  },
};
