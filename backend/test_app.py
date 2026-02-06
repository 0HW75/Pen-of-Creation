print("Testing app import...")
try:
    from app import create_app
    print("App imported successfully!")
    app = create_app()
    print("App created successfully!")
    print("App test completed successfully!")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
