'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('RabbiEvents', ['event'], );
    await queryInterface.addIndex('RabbiEvents', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('RabbiEvents', ['event']);
    await queryInterface.removeIndex('RabbiEvents', ['createdAt']);
  }
};
