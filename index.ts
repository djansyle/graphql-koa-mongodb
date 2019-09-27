import Koa from 'koa';
import { ApolloServer } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import typeDefs from './resolvers/typeDefs';
import Query from './resolvers/resolvers';
import Mutation from './resolvers/mutation';

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Query,
        Mutation
    }
})

const server = new ApolloServer({
    schema,
})

const app = new Koa();

server.applyMiddleware({ app });

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-acxdw.mongodb.net/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected successfully to mongoDB'))
.catch(err => console.log('Failed to connect to mongoDB ' + err.message))

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`server is ready at http://localhost:4000${server.graphqlPath}`);
})


