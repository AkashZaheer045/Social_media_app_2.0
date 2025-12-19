'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, _Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkInsert('roles', [
                { id: 1, name: 'superadmin', createdAt: new Date(), updatedAt: new Date() },
                { id: 2, name: 'admin', createdAt: new Date(), updatedAt: new Date() },
                { id: 3, name: 'user', createdAt: new Date(), updatedAt: new Date() },
            ], { transaction });

            await transaction.commit();
            console.log('✓ Seeder: Added default roles (superadmin, admin, user)');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Seeder failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, _Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.bulkDelete('roles', null, { transaction });
            await transaction.commit();
            console.log('✓ Rollback Seeder: Removed default roles');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback Seeder failed:', error.message);
            throw error;
        }
    },
};
