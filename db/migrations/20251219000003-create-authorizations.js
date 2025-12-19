'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'authorizations'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count > 0) {
            console.log('⚠ Migration 003: Table "authorizations" already exists, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('authorizations', {
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
                    onDelete: 'CASCADE',
                },
                access_token: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                refresh_token: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                device_type: {
                    type: Sequelize.STRING(100),
                    allowNull: true,
                },
                device_token: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                platform: {
                    type: Sequelize.STRING(50),
                    allowNull: true,
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

            // Add indexes
            await queryInterface.addIndex('authorizations', ['access_token'], {
                name: 'authorizations_access_token_idx',
                transaction,
            });
            await queryInterface.addIndex('authorizations', ['refresh_token'], {
                name: 'authorizations_refresh_token_idx',
                transaction,
            });

            await transaction.commit();
            console.log('✓ Migration 003: Created authorizations table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration 003 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Check if table exists before dropping
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'authorizations'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count === 0) {
            console.log('⚠ Rollback 003: Table "authorizations" does not exist, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('authorizations', { transaction });
            await transaction.commit();
            console.log('✓ Rollback 003: Dropped authorizations table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback 003 failed:', error.message);
            throw error;
        }
    },
};
