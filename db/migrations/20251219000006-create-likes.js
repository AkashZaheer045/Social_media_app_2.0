'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'likes'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count > 0) {
            console.log('⚠ Migration 006: Table "likes" already exists, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('likes', {
                id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                user_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                target_id: {
                    type: Sequelize.BIGINT.UNSIGNED,
                    allowNull: false,
                },
                target_type: {
                    type: Sequelize.ENUM('post', 'comment'),
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

            // Add unique constraint for one like per user per target
            await queryInterface.addIndex('likes', ['user_id', 'target_id', 'target_type'], {
                name: 'likes_unique_user_target',
                unique: true,
                transaction,
            });

            // Add index for querying likes by target
            await queryInterface.addIndex('likes', ['target_id', 'target_type'], {
                name: 'likes_target_idx',
                transaction,
            });

            await transaction.commit();
            console.log('✓ Migration 006: Created likes table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration 006 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Check if table exists before dropping
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'likes'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count === 0) {
            console.log('⚠ Rollback 006: Table "likes" does not exist, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('likes', { transaction });
            await transaction.commit();
            console.log('✓ Rollback 006: Dropped likes table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback 006 failed:', error.message);
            throw error;
        }
    },
};
