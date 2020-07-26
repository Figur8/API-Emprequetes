import { getRepository, Repository } from "typeorm";
import { Request } from "express";
import { BaseNotification } from "../entity/BaseNotification";

export abstract class BaseController<T> extends BaseNotification{

    private _repository: Repository<T>;

    constructor(entity: any){
        super();
        this._repository = getRepository<T>(entity);
    }

    async all() {
        return this._repository.find({
            where: {
                deleted: false
            }
        });
    }

    async one(request: Request) {
        return this._repository.findOne(request.params.id);
    }

    async save(model: any) {
        if(model.uid) {
            delete model['uid'];
            delete model['createAt'];
            delete model['updateAt'];
            delete model['deleted'];

            let _modelInDB = await this._repository.findOne(model.uid);
            if(_modelInDB) {
                Object.assign(_modelInDB, model);
            }
        }

        if(this.valid()){
            return await this._repository.save(model);
        }else return {
            status: 400,
            errors: this.allNotifications
        }
    }

    async remove(request: Request) {
        let uid = request.params.id;
        let model: any = await this._repository.findOne(uid);
        if(model) {
            model.deleted = true;
            return await this._repository.save(model);
        }else{
            return{
                status: 404,
                errors: [
                    'Item não encontrado'
                ]
            }
        }
    }

    get repository(): Repository<T>{
        return this._repository;
    }
}