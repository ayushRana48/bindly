const {notifyGroupStart, notifyGroupEnd } = require('./groupTime')
const {notifyPost} = require('./postTime')

exports.handler = async (event) => {
  console.log('callNOW')
    try {
      await Promise.all([
        notifyGroupEnd(),
        notifyGroupStart(),
        notifyPost()
      ]);
    } catch (error) {
      console.error('Error running notification tasks:', error);
    }
  };