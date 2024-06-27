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
from submodule.rs_project import RsProjectManager, RsProjectState
from .errors import errors

#-----------------------------------------------------------------------#
# endpoints         | methods                   | classes               #
#-----------------------------------------------------------------------#
# /project          | GET, POST, PATCH, DELETE  | ProjectApi            #
#-----------------------------------------------------------------------#

class ProjectDataSchema(Schema):
    autosave = fields.Bool()
    device = fields.Str()
    lang = fields.Str()
    name = fields.Str()
    notes = fields.Str()

class ProjectSchema(ProjectDataSchema):
    filepath = fields.Str()
    version = fields.Str()
    state = fields.Enum(RsProjectState, by_value=True)
    messages = fields.Nested(MessageSchema, many=True)

class ProjectApi(Resource):
    def get(self):
        """
        This endpoint returns project-specific details e.g. notes, state etc.
        ---
        tags:
            - Project
        description: Returns project-specific details.
        definitions:
            ProjectData:
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
                    - $ref: '#/definitions/ProjectData'
                    - type: object
                      properties:
                        filepath:
                            type: string
                        version:
                            type: string
                        state:
                            type: string
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
        This endpoint open or save the project-specific details in a file specified in the filepath attribute.
        ---
        tags:
            - Project
        description: Returns project-specific details.
        parameters:
            - name: project
              in: body
              description: Specify file path to save or open
              schema:
                type: object
                properties:
                    filepath:
                        type: string
        responses:
            201:
                description: Successfully opened/saved project-specific details
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
        pass

    def patch(self):
        """
        This endpoint updates the project-specific details.
        ---
        tags:
            - Project
        description: Update project-specific details.
        parameters:
            - name: project
              in: body
              description: Data attributes to update
              schema:
                $ref: '#/definitions/ProjectData'
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
            proj_mgr.update(ProjectDataSchema().load(request.json))
            return ProjectSchema().dump(proj_mgr.get()), 200
        except ValidationError as e:
            raise SchemaValidationError
        except Exception as e:
            raise InternalServerError

    def delete(self):
        """
        This endpoint close and release the project file.
        ---
        tags:
            - Project
        description: Close and release project.
        responses:
            204:
                description: Successfully close and release the project file
            400:
                description: Invalid request 
                schema:
                    $ref: '#/definitions/HTTPErrorMessage'
        """
        pass

project_api = Blueprint('project_api', __name__)
api = Api(project_api, errors=errors)
api.add_resource(ProjectApi, '/project')
