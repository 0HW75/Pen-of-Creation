from app import create_app

app = create_app()

with app.app_context():
    print("Testing model imports...")
    try:
        from app.models import Project
        print("Project model imported successfully!")
    except Exception as e:
        print(f"Error importing Project model: {e}")
    
    try:
        from app.models import Character
        print("Character model imported successfully!")
    except Exception as e:
        print(f"Error importing Character model: {e}")
    
    try:
        from app.models import Location
        print("Location model imported successfully!")
    except Exception as e:
        print(f"Error importing Location model: {e}")
    
    try:
        from app.models import Item
        print("Item model imported successfully!")
    except Exception as e:
        print(f"Error importing Item model: {e}")
    
    try:
        from app.models import Faction
        print("Faction model imported successfully!")
    except Exception as e:
        print(f"Error importing Faction model: {e}")
    
    try:
        from app.models import Relationship
        print("Relationship model imported successfully!")
    except Exception as e:
        print(f"Error importing Relationship model: {e}")
    
    print("Model import test completed!")
