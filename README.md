## NODEJS SIMPLE TIC-TAC-TOE APP

This is a simple GRAPHQL API for a TIC-TAC-TOE game.

### Description

- When a new game is created, new user is automatically created.
- Request returns a GAME ID and PLAYER ID, both need to be used to make moves in a game.
- When making moves GAME ID and PLAYER ID need to be sent, together with field reference.
- Fields are referenced by ROW number and COLUMN number in form of [ROW, COLUMN].
- Player can play in a multiplayer game in a single-player game.
- In a single-player game a simple random pick of available fields is used by the internal "AI".
- API is open to expansion by implementing a persistent database and better AI.

- Open http://localhost:4000/ in browser to test GraphQL queries, mutations and subscriptions.


## Pre-requirements

- NodeJS and NPM.
- Tested with version 12.18.2.

## Run the app

    npm install
    npm start

# GRAPHQL Requests

## Mutation createGame

### Request

```graphql
mutation {
  createGame(data: {
    isMultiplayer: false
  }) {
    playerId
    gameId
  }
}
```

### Valid Response

```json
{
  "data": {
    "createGame": {
      "playerId": "b36a341e-a7cd-4181-aa0d-bc17376ca5fd",
      "gameId": "ac212a55-fb3c-42b1-980c-3b4301fa4505"
    }
  }
}
```

## Mutation joinGame

### Request

```graphql
mutation {
  joinGame(data: {
    gameId: "ac212a55-fb3c-42b1-980c-3b4301fa4505"
  }) {
    playerId
    gameId
  }
}
```

### Valid Response

```json
{
  "data": {
    "joinGame": {
      "playerId": "44fe0435-921a-4c65-b9f9-7b5b6bfeb19b",
      "gameId": "4891dc1a-2e6c-45b1-b535-cdef42933d54"
    }
  }
}
```

### Error Response Example

```json
{
  "data": null,
  "errors": [
    {
      "message": "Cannot join a multiplayer game with two player already",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "joinGame"
      ]
    }
  ]
}
```

## Mutation Move

### Request

```graphql
mutation {
  move(data: {
    gameId: "ac212a55-fb3c-42b1-980c-3b4301fa4505",
    playerId: "44fe0435-921a-4c65-b9f9-7b5b6bfeb19b",
    field: [2, 0]
  }) {
    gameId
    moves {
      char
      field
    }
     result {
      result
      winningChar
    }
  }
}
```

### Valid Response

```json
{
  "data": {
    "move": {
      "gameId": "12038e99-d5ce-4316-8186-677755e9035a",
      "moves": [
        {
          "char": "O",
          "field": [
            2,
            0
          ]
        }
      ],
      "result": null
    }
  }
}
```

### Error Response Example

```json
{
  "data": null,
  "errors": [
    {
      "message": "Player ea571a35-1b00-4522-9134-296c5aefb795 cannot make a move in game 12038e99-d5ce-4316-8186-677755e9035a",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "move"
      ]
    }
  ]
}
```

## Query getHistory

### Request

```graphql
query {
  getHistory(data: {
    playerId: "b36a341e-a7cd-4181-aa0d-bc17376ca5fd"
  }) {
    id
    moves {
      char
      field
    }
    result {
      result
      winningChar
    }
    players {
      id
      char
    }
  }
}
```

### Valid Response

```json
{
  "data": {
    "getHistory": [
      {
        "id": "28dbc5b3-9f26-4d49-a8fe-8f4e35ec8776",
        "moves": [
          {
            "char": "O",
            "field": [
              1,
              2
            ]
          },
          {
            "char": "X",
            "field": [
              2,
              1
            ]
          },
          {
            "char": "O",
            "field": [
              1,
              1
            ]
          },
          {
            "char": "X",
            "field": [
              0,
              2
            ]
          },
          {
            "char": "O",
            "field": [
              1,
              0
            ]
          }
        ],
        "result": {
          "result": "win",
          "winningChar": "O"
        },
        "players": [
          {
            "id": "b36a341e-a7cd-4181-aa0d-bc17376ca5fd",
            "char": "O"
          }
        ]
      }
    ]
  }
}
```

## Subscription game

### Request

```graphql
subscription {
  game( data: {
    gameId: "175e04d8-361b-42d1-b697-5696a5c8d81c",
    playerId: "a1072b8d-67f2-4c79-a25b-60a053919fe8"
  }) {
    data {
        gameId
        moves {
          char
          field
        }
        result {
          result
          winningChar
        }
      }
    }
}
```

### Valid Response

```json
{
  "data": {
    "game": {
      "data": {
        "gameId": "ead9f8e0-7ef9-43cc-b647-375ddebdf9eb",
        "moves": [
          {
            "char": "x",
            "field": [
              0,
              2
            ]
          }
        ],
        "result": null
      }
    }
  }
}
```