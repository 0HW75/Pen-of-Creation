from app import create_app, db
from app.models import CharacterTrait, Project

# 创建应用实例
app = create_app()

# 添加应用上下文
with app.app_context():
    # 打印所有项目
    print("=== 所有项目 ===")
    projects = Project.query.all()
    for project in projects:
        print(f"项目ID: {project.id}, 标题: {project.title}")
        
        # 打印该项目的所有角色特质
        print(f"\n项目 {project.title} 的角色特质:")
        traits = CharacterTrait.query.filter_by(project_id=project.id).all()
        if traits:
            for trait in traits:
                print(f"  ID: {trait.id}, 名称: {trait.name}, 描述: {trait.description}")
        else:
            print("  无角色特质")
        print()

    # 打印所有角色特质
    print("=== 所有角色特质 ===")
    all_traits = CharacterTrait.query.all()
    for trait in all_traits:
        print(f"ID: {trait.id}, 项目ID: {trait.project_id}, 名称: {trait.name}, 描述: {trait.description}")
