'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'temp_tokens'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count > 0) {
            console.log('⚠ Migration 008: Table "temp_tokens" already exists, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('temp_tokens', {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                },
                token: {
                    type: Sequelize.STRING(255),
                    allowNull: true,
                },
                expiresAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
                used: {
                    type: Sequelize.TINYINT(1),
                    allowNull: false,
                    defaultValue: 0,
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
            await queryInterface.addIndex('temp_tokens', ['userId'], {
                name: 'temp_tokens_user_id_idx',
                transaction,
            });
            await queryInterface.addIndex('temp_tokens', ['token'], {
                name: 'temp_tokens_token_idx',
                transaction,
            });
            await queryInterface.addIndex('temp_tokens', ['expiresAt'], {
                name: 'temp_tokens_expires_at_idx',
                transaction,
            });

            await transaction.commit();
            console.log('✓ Migration 008: Created temp_tokens table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration 008 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Check if table exists before dropping
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'temp_tokens'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count === 0) {
            console.log('⚠ Rollback 008: Table "temp_tokens" does not exist, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('temp_tokens', { transaction });
            await transaction.commit();
            console.log('✓ Rollback 008: Dropped temp_tokens table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback 008 failed:', error.message);
            throw error;
        }
    },
};
