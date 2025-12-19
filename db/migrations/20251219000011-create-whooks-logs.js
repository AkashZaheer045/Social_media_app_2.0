'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'whooks_logs'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count > 0) {
            console.log('⚠ Migration 011: Table "whooks_logs" already exists, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('whooks_logs', {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                user_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
                },
                event_type: {
                    type: Sequelize.STRING(100),
                    allowNull: true,
                },
                payload: {
                    type: Sequelize.JSON,
                    allowNull: false,
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

            // Add index
            await queryInterface.addIndex('whooks_logs', ['event_type'], {
                name: 'whooks_logs_event_type_idx',
                transaction,
            });

            await transaction.commit();
            console.log('✓ Migration 011: Created whooks_logs table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration 011 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Check if table exists before dropping
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'whooks_logs'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count === 0) {
            console.log('⚠ Rollback 011: Table "whooks_logs" does not exist, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('whooks_logs', { transaction });
            await transaction.commit();
            console.log('✓ Rollback 011: Dropped whooks_logs table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback 011 failed:', error.message);
            throw error;
        }
    },
};
