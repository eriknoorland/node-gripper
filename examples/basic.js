const Gripper = require('../index');
const gripper = Gripper('/dev/tty.usbmodem141301');

async function onGripperInitialized() {
  await gripper.config(35, 125, 75, 120);

  setTimeout(async () => {
    await gripper.close();
    await gripper.lift();
  }, 500);

  setTimeout(async () => {
    await gripper.lower();
    await gripper.open();
  }, 3000);
};

gripper.init()
  .then(onGripperInitialized);
