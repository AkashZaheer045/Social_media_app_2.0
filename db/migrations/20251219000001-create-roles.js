'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'roles'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count > 0) {
            console.log('⚠ Migration 001: Table "roles" already exists, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('roles', {
                id: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: Sequelize.ENUM('superadmin', 'admin', 'user'),
                    allowNull: false,
                    defaultValue: 'user',
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
                },
            }, { transaction });

            await transaction.commit();
            console.log('✓ Migration 001: Created roles table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration 001 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Check if table exists before dropping
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'roles'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count === 0) {
            console.log('⚠ Rollback 001: Table "roles" does not exist, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('roles', { transaction });
            await transaction.commit();
            console.log('✓ Rollback 001: Dropped roles table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback 001 failed:', error.message);
            throw error;
        }
    },
};
