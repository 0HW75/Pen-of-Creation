import re
import os

base_path = r'd:\个人\myproj\AI_novel_editor\frontend\src\services'
file_path = os.path.join(base_path, 'api.js')

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix getCharacters
    content = content.replace(
        'getCharacters: (projectId, worldId, signal) => {',
        'getCharacters: (projectId, worldId, cancelToken) => {'
    )
    content = content.replace(
        "return api.get('/characters', { params, signal });",
        "return api.get('/characters', { params, cancelToken });"
    )
    
    # Fix getCharacter
    content = content.replace(
        'getCharacter: (id, signal) => api.get(`/characters/${id}`, { signal })',
        'getCharacter: (id, cancelToken) => api.get(`/characters/${id}`, { cancelToken })'
    )
    
    # Fix getLocations
    content = content.replace(
        "getLocations: (projectId, signal) => api.get('/locations', { params: { project_id: projectId }, signal })",
        "getLocations: (projectId, cancelToken) => api.get('/locations', { params: { project_id: projectId }, cancelToken })"
    )
    
    # Fix getLocation
    content = content.replace(
        'getLocation: (id, signal) => api.get(`/locations/${id}`, { signal })',
        'getLocation: (id, cancelToken) => api.get(`/locations/${id}`, { cancelToken })'
    )
    
    # Fix getFactions
    content = content.replace(
        "getFactions: (projectId, signal) => api.get('/factions', { params: { project_id: projectId }, signal })",
        "getFactions: (projectId, cancelToken) => api.get('/factions', { params: { project_id: projectId }, cancelToken })"
    )
    
    # Fix getFaction
    content = content.replace(
        'getFaction: (id, signal) => api.get(`/factions/${id}`, { signal })',
        'getFaction: (id, cancelToken) => api.get(`/factions/${id}`, { cancelToken })'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Fixed: {file_path}')
else:
    print(f'File not found: {file_path}')

print('Done!')
