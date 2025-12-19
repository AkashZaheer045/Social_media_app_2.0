'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if table already exists
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'posts'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count > 0) {
            console.log('⚠ Migration 004: Table "posts" already exists, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.createTable('posts', {
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
                content: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                media_url: {
                    type: Sequelize.STRING(500),
                    allowNull: true,
                },
                visibility: {
                    type: Sequelize.ENUM('public', 'private'),
                    allowNull: false,
                    defaultValue: 'public',
                },
                tags: {
                    type: Sequelize.JSON,
                    allowNull: true,
                },
                likes_count: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: false,
                    defaultValue: 0,
                },
                comments_count: {
                    type: Sequelize.INTEGER.UNSIGNED,
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
                deletedAt: {
                    type: Sequelize.DATE,
                    allowNull: true,
                },
            }, { transaction });

            // Add indexes
            await queryInterface.addIndex('posts', ['visibility'], {
                name: 'posts_visibility_idx',
                transaction,
            });
            await queryInterface.addIndex('posts', ['createdAt'], {
                name: 'posts_created_at_idx',
                transaction,
            });

            await transaction.commit();
            console.log('✓ Migration 004: Created posts table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Migration 004 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        // Check if table exists before dropping
        const tableExists = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = 'posts'`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (tableExists[0].count === 0) {
            console.log('⚠ Rollback 004: Table "posts" does not exist, skipping...');
            return;
        }

        const transaction = await queryInterface.sequelize.transaction();

        try {
            await queryInterface.dropTable('posts', { transaction });
            await transaction.commit();
            console.log('✓ Rollback 004: Dropped posts table');
        } catch (error) {
            await transaction.rollback();
            console.error('✗ Rollback 004 failed:', error.message);
            throw error;
        }
    },
};
