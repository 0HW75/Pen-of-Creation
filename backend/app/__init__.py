from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 导入API路由
from app.api import ai, analysis, blueprint, chapter, character, export, faction, item, location, navigation, project, relationship

if __name__ == '__main__':
    app.run(debug=True)
