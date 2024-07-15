#
#  Copyright (C) 2024 RapidSilicon
#  Authorized use only
#
import sys
from flask import Blueprint, request
from flask_restful import Api, Resource
from marshmallow import Schema, fields, ValidationError
from api.errors import InternalServerError, SchemaValidationError
from api.device import MessageSchema
from submodule.rs_device_resources import ProjectNotLoadedException
from submodule.rs_project import RsProjectManager, RsProjectState
from .errors import CreateProjectPermissionError, ProjectFileNotFoundError, ProjectNotLoadedError, errors

#-----------------------------------------------------------------------#
# endpoints         | methods                   | classes               #
#-----------------------------------------------------------------------#
# /project          | GET, POST, PATCH          | ProjectApi            #
# /project/create   | POST                      | ProjectCreateApi      #
# /project/open     | POST                      | ProjectOpenApi        #
# /project/close    | POST                      | ProjectCloseApi       #
#-----------------------------------------------------------------------#

class ProjectAttributesSchema(Schema):
    autosave = fields.Bool()
    device = fields.Str()
    lang = fields.Str()
    name = fields.Str()
    notes = fields.Str()

class ProjectSchema(ProjectAttributesSchema):
    filepath = fields.Str()
    version = fields.Str()
    state = fields.Enum(RsProjectState, by_value=True)
    modified = fields.Bool()
    last_edited = fields.DateTime()
    messages = fields.Nested(MessageSchema, many=True)

class ProjectFilepathSchema(Schema):
    filepath = fields.Str()

class ProjectApi(Resource):
    def get(self):
        """
        This endpoint returns project-specific details e.g. notes, state etc.
        ---
        tags:
            - Project
        description: Returns project-specific details.
        definitions:
            ProjectAttributes:
                type: object
                properties:
                    autosave:
                        type: boolean
                    device:
                        type: string
                    lang:
                        type: string
                    name:
                        type: string
                    notes:
                        type: string
            Project:
                allOf:
                    - $ref: '#/definitions/ProjectAttributes'
                    - type: object
                      properties:
                        filepath:
                            type: string
                        version:
                            type: string
                        state:
                            type: string
                        modified:
                            type: boolean
                        last_edited:
                            type: dateTime
        responses:
            200:
                description: Successfully returned project-specific details
                schema:
                    allOf:
                        - $ref: '#/definitions/Project'
                        - type: object
                          properties:
                            messages:
                                type: array
                                items:
                                    $ref: '#/definitions/Message'
        """
        try:
            proj_mgr = RsProjectManager.get_instance()
            schema = ProjectSchema()
            return schema.dump(proj_mgr.get()), 200
        except Exception as e:
            raise InternalServerError

    def post(self):
        """
        This endpoint saves the current changes e.g. project attributes, device inputs into the currently open project file.
        ---
        tags:
            - Project
        description: Returns project-specific details.
        responses:
            201:
                description: Successfully saved project details
                schema:
                    allOf:
                        - $ref: '#/definitions/Project'
                        - type: object
                          properties:
                            messages:
                                type: array
                                items:
                                    $ref: '#/definitions/Message'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
            403:
                description: Schema validation error
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            proj_mgr = RsProjectManager.get_instance()
            proj_mgr.save()
            return ProjectSchema().dump(proj_mgr.get()), 201
        except ValidationError as e:
            raise SchemaValidationError
        except ProjectNotLoadedException as e:
            raise ProjectNotLoadedError
        except Exception as e:
            raise InternalServerError

    def patch(self):
        """
        This endpoint updates the project attributes in memory. The endpoint doesn’t trigger to save the changes to the project file (if one is currently open).
        ---
        tags:
            - Project
        description: Update project-specific details.
        parameters:
            - name: project
              in: body
              description: Data attributes to update
              schema:
                $ref: '#/definitions/ProjectAttributes'
        responses:
            200:
                description: Successfully updated project-specific details
                schema:
                    allOf:
                        - $ref: '#/definitions/Project'
                        - type: object
                          properties:
                            messages:
                                type: array
                                items:
                                    $ref: '#/definitions/Message'
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
            403:
                description: Schema validation error
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            proj_mgr = RsProjectManager.get_instance()
            proj_mgr.update(ProjectAttributesSchema().load(request.json))
            return ProjectSchema().dump(proj_mgr.get()), 200
        except ValidationError as e:
            raise SchemaValidationError
        except Exception as e:
            raise InternalServerError

class ProjectCreateApi(Resource):
    def post(self):
        """
        This endpoint creates and save the current project attributes and device inputs into new a project file.
        ---
        tags:
            - Project
        description: Create and save project file.
        parameters:
            - name: file
              in: body
              description: File to create
              schema:
                type: object
                properties:
                    filepath:
                        type: string
        responses:
            204:
                description: Successfully create a new project file.
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            proj_mgr = RsProjectManager.get_instance()
            proj_mgr.create(ProjectFilepathSchema().load(request.json)['filepath'])
            return "", 204
        except ValidationError as e:
            raise SchemaValidationError
        except PermissionError as e:
            raise CreateProjectPermissionError
        except Exception as e:
            raise InternalServerError

class ProjectOpenApi(Resource):
    def post(self):
        """
        This endpoint open and loads an existing project file.
        ---
        tags:
            - Project
        description: Open project file.
        parameters:
            - name: file
              in: body
              description: File to open
              schema:
                type: object
                properties:
                    filepath:
                        type: string
        responses:
            204:
                description: Successfully open project file.
            400:
                description: Invalid request
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            proj_mgr = RsProjectManager.get_instance()
            proj_mgr.open(ProjectFilepathSchema().load(request.json)['filepath'])
            return "", 204
        except FileNotFoundError as e:
            raise ProjectFileNotFoundError
        except ValidationError as e:
            raise SchemaValidationError
        except Exception as e:
            raise InternalServerError

class ProjectCloseApi(Resource):
    def post(self):
        """
        This endpoint closes the currently open project.
        ---
        tags:
            - Project
        description: Close project file.
        responses:
            204:
                description: Successfully close project file.
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        try:
            proj_mgr = RsProjectManager.get_instance()
            proj_mgr.close()
            return "", 204
        except ValidationError as e:
            raise SchemaValidationError
        except Exception as e:
            raise InternalServerError

project_api = Blueprint('project_api', __name__)
api = Api(project_api, errors=errors)
api.add_resource(ProjectApi, '/project')
api.add_resource(ProjectCreateApi, '/project/create')
api.add_resource(ProjectOpenApi, '/project/open')
api.add_resource(ProjectCloseApi, '/project/close')
