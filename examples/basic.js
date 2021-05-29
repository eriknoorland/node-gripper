const Gripper = require('../index');
const gripper = Gripper('/dev/tty.usbserial-14130');

const jawCloseAngle = 35;
const jawWideAngle = 85;
const jawOpenAngle = 125;
const liftUpAngle = 75;
const liftDownAngle = 120;

async function onGripperInitialized() {
  await gripper.setJawAngle(jawOpenAngle);
  await gripper.setLiftAngle(liftDownAngle);

  setTimeout(async () => {
    await gripper.setJawAngle(jawWideAngle);
  }, 500);

  setTimeout(async () => {
    await gripper.setJawAngle(jawCloseAngle);
    await gripper.setLiftAngle(liftUpAngle);
  }, 1500);

  setTimeout(async () => {
    await gripper.setLiftAngle(liftDownAngle);
    await gripper.setJawAngle(jawOpenAngle);
  }, 3000);
};

gripper.init()
  .then(onGripperInitialized);
