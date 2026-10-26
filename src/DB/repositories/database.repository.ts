import type { Model, Document, UpdateQuery, QueryOptions, QueryFilter } from "mongoose";

/**
 * Generic base repository providing common CRUD operations.
 * All specific repositories should extend this class.
 */
export class DatabaseRepository<T extends Document> {
    constructor(protected readonly model: Model<T>) {}

    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data);
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findOne(filter: QueryFilter<T>): Promise<T | null> {
        return await this.model.findOne(filter);
    }

    async findAll(filter: QueryFilter<T> = {} as QueryFilter<T>, options?: QueryOptions): Promise<T[]> {
        return await this.model.find(filter, null, options);
    }

    async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true });
    }

    async deleteById(id: string): Promise<T | null> {
        return await this.model.findByIdAndDelete(id);
    }

    async count(filter: QueryFilter<T> = {} as QueryFilter<T>): Promise<number> {
        return await this.model.countDocuments(filter);
    }
}
