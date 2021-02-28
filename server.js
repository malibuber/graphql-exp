const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull

} = require("graphql")

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
	{ id: 8, name: 'Beyond the Shadows', authorId: 3 }
]


const app = express()

const BookType = new GraphQLObjectType({
    name : "book",
    description:  "book and writter",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) =>{
                return authors.find(author => author.id === book.id)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name : "auther",
    description:  "writter",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books:{
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})


const RootQueryType = new GraphQLObjectType({
   name : "Query",
   description: "Root Query",
   fields: () => ({
        book: {
           type: BookType,
           description:  "single book",
           args: {
               id : {type: GraphQLInt}
           },
           resolve: (parant, args) => books.find(book => book.id === args.id)
       },
       books: {
           type: new GraphQLList(BookType),
           description:  "list of all books",
           resolve: () => books
       },
       authors: {
        type: new GraphQLList(AuthorType),
        description:  "list of all authers",
        resolve: () => authors
        },
        author: {
            type: AuthorType,
            description:  "sinlge authers",
            args:{
                id:{type: GraphQLInt} 
            },
            resolve: (parant, args) => authors.find(auther => auther.id === args.id)
        } 
    })

})

const RootMutationType = new GraphQLObjectType({
    name: "mutation",
    description:"root muta",
    fields: () => ({
        addBook:{
            type: BookType,
            description: "add a book",
            args:{
                name:{type: GraphQLNonNull(GraphQLString)},
                authorId:{type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent ,args) => {
                const book = { id : books.length + 1 , name:args.name , autherId: args.autherId}
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
              name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
              const author = { id: authors.length + 1, name: args.name }
              authors.push(author)
              return author
            }
        },
    })
})

const schema =  new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})


app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
  }))


app.listen(5000 , () => console.log("server running"))