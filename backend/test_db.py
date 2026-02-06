from app import create_app, db

app = create_app()

with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("Database tables created successfully!")
    print("Checking database tables...")
    from app.models import Project, Character, Location, Item, Faction, Relationship
    print("All models imported successfully!")
    print("Database test completed successfully!")
