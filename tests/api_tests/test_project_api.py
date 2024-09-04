import pytest
from flask import Flask, json
from api.project import project_api
from submodule.rs_project import RsProjectManager, RsProjectState
from submodule.rs_device_resources import ProjectNotLoadedException
from marshmallow import ValidationError
from unittest.mock import patch
from marshmallow import Schema, fields
from datetime import datetime

class ProjectAttributesSchema(Schema):
    autosave = fields.Bool(dump_default=False)
    device = fields.Str()
    lang = fields.Str()
    name = fields.Str()
    notes = fields.Str()

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(project_api, url_prefix='/api')
    with app.test_client() as client:
        yield client

def test_get_project(client, mocker):
    mock_proj_mgr = mocker.patch.object(RsProjectManager, 'get_instance')
    mock_instance = mock_proj_mgr.return_value
    mock_instance.get.return_value = {
        'autosave': True,
        'device': 'device1',
        'lang': 'en',
        'name': 'Test Project',
        'notes': 'Test notes',
        'filepath': '/path/to/file',
        'version': '1.0',
        'state': RsProjectState.LOADED,  # Use the correct state from the enum
        'modified': False,
        'last_edited': datetime(2024, 1, 1, 12, 0, 0),  # Corrected to use datetime object
        'messages': []
    }

    response = client.get('/api/project')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['name'] == 'Test Project'

def test_post_project(client, mocker):
    mock_proj_mgr = mocker.patch.object(RsProjectManager, 'get_instance')
    mock_instance = mock_proj_mgr.return_value
    mock_instance.get.return_value = {
        'autosave': True,
        'device': 'device1',
        'lang': 'en',
        'name': 'Test Project',
        'notes': 'Test notes',
        'filepath': '/path/to/file',
        'version': '1.0',
        'state': RsProjectState.LOADED,  # Use the correct state from the enum
        'modified': False,
        'last_edited': datetime(2024, 1, 1, 12, 0, 0),  # Corrected to use datetime object
        'messages': []
    }

    response = client.post('/api/project')
    assert response.status_code == 201

def test_patch_project(client, mocker):
    mock_proj_mgr = mocker.patch.object(RsProjectManager, 'get_instance')
    mock_instance = mock_proj_mgr.return_value
    mock_load = mocker.patch('api.project.ProjectAttributesSchema.load')

    mock_load.return_value = {
        'name': 'Updated Project'
    }
    
    mock_instance.get.return_value = {
        'autosave': True,
        'device': 'device1',
        'lang': 'en',
        'name': 'Updated Project',
        'notes': 'Updated notes',
        'filepath': '/path/to/file',
        'version': '1.0',
        'state': RsProjectState.LOADED,  # Use the correct state from the enum
        'modified': False,
        'last_edited': datetime(2024, 1, 1, 12, 0, 0),  # Corrected to use datetime object
        'messages': []
    }

    response = client.patch('/api/project', json={'name': 'Updated Project'})
    assert response.status_code == 200

def test_post_create_project(client, mocker):
    mock_proj_mgr = mocker.patch.object(RsProjectManager, 'get_instance')
    mock_instance = mock_proj_mgr.return_value
    response = client.post('/api/project/create', json={'filepath': '/path/to/new_project'})
    assert response.status_code == 204
    mock_instance.create.assert_called_once_with('/path/to/new_project')

def test_post_open_project(client, mocker):
    mock_proj_mgr = mocker.patch.object(RsProjectManager, 'get_instance')
    mock_instance = mock_proj_mgr.return_value
    response = client.post('/api/project/open', json={'filepath': '/path/to/existing_project'})
    assert response.status_code == 204
    mock_instance.open.assert_called_once_with('/path/to/existing_project')

def test_post_close_project(client, mocker):
    mock_proj_mgr = mocker.patch.object(RsProjectManager, 'get_instance')
    mock_instance = mock_proj_mgr.return_value
    response = client.post('/api/project/close')
    assert response.status_code == 204
    mock_instance.close.assert_called_once()

def test_post_create_project_validation_error(client, mocker):
    mock_proj_mgr = mocker.patch.object(RsProjectManager, 'get_instance')
    mock_instance = mock_proj_mgr.return_value
    mock_instance.create.side_effect = ValidationError('Invalid input')
    response = client.post('/api/project/create', json={'filepath': ''})
    assert response.status_code == 403

def test_post_open_project_not_found_error(client, mocker):
    mock_proj_mgr = mocker.patch.object(RsProjectManager, 'get_instance')
    mock_instance = mock_proj_mgr.return_value
    mock_instance.open.side_effect = FileNotFoundError
    response = client.post('/api/project/open', json={'filepath': '/path/to/missing_project'})
    assert response.status_code == 400
