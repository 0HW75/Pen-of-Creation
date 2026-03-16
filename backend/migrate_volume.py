#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
数据库迁移脚本：为 chapter 表添加 volume 字段
"""
import sqlite3
import os

# 获取数据库路径 - 使用正确的数据库文件
db_path = os.path.join(os.path.dirname(__file__), 'app', 'novel_editor.db')

def migrate():
    """添加 volume 字段到 chapter 表"""
    print(f"数据库路径: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"❌ 数据库文件不存在: {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 获取所有表名
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        table_names = [t[0] for t in tables]
        print(f"数据库中的表: {table_names}")
        
        # 查找 chapter 表（可能是 chapter 或 chapters）
        chapter_table = None
        for name in table_names:
            if name.lower() in ['chapter', 'chapters']:
                chapter_table = name
                break
        
        if not chapter_table:
            print("❌ 未找到 chapter 表")
            return
        
        print(f"使用表名: {chapter_table}")
        
        # 检查 volume 字段是否已存在
        cursor.execute(f"PRAGMA table_info({chapter_table})")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        print(f"现有字段: {column_names}")

        if 'volume' not in column_names:
            # 添加 volume 字段
            cursor.execute(f"ALTER TABLE {chapter_table} ADD COLUMN volume VARCHAR(255) DEFAULT ''")
            conn.commit()
            print("✅ 成功添加 volume 字段到 chapter 表")
        else:
            print("✅ volume 字段已存在，无需添加")

    except Exception as e:
        print(f"❌ 迁移失败: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
