import { Request, Response, NextFunction } from 'express'
import { User } from '../models/User'
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from '../helpers/httpStatusCodes'

export interface AuthRequest extends Request {
  auth?: {
    payload: {
      sub: string
      email?: string
      name?: string
      nickname?: string
    }
  }
}

export const registerUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth0Payload = req.auth?.payload

    if (!auth0Payload || !auth0Payload.sub) {
      res.status(UNAUTHORIZED).json({ error: 'Authentication required' })
      return
    }

    const { name, email } = req.body

    if (!name || !email) {
      res.status(BAD_REQUEST).json({ error: 'Name and email are required' })
      return
    }

    // Extract username from email or use nickname from Auth0
    const username =
      req.body.username || auth0Payload.nickname || email.split('@')[0]

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { auth0Id: auth0Payload.sub },
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    })

    if (existingUser) {
      res.status(BAD_REQUEST).json({
        error: 'User already exists with this email, username, or Auth0 ID',
      })
      return
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      auth0Id: auth0Payload.sub,
    })

    await user.save()

    res.status(CREATED).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    })
  } catch (error) {
    console.error('Register user error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to register user' })
  }
}

export const loginUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth0Payload = req.auth?.payload

    if (!auth0Payload || !auth0Payload.sub) {
      res.status(UNAUTHORIZED).json({ error: 'Authentication required' })
      return
    }

    // Find user by Auth0 ID
    const user = await User.findOne({ auth0Id: auth0Payload.sub })

    if (!user) {
      res
        .status(NOT_FOUND)
        .json({ error: 'User not found. Please register first.' })
      return
    }

    res.status(OK).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    })
  } catch (error) {
    console.error('Login user error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to login user' })
  }
}

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const auth0Payload = req.auth?.payload

    if (!auth0Payload || !auth0Payload.sub) {
      res.status(UNAUTHORIZED).json({ error: 'Authentication required' })
      return
    }

    const user = await User.findOne({ auth0Id: auth0Payload.sub })

    if (!user) {
      res.status(NOT_FOUND).json({ error: 'User not found' })
      return
    }

    res.status(OK).json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(INTERNAL_SERVER_ERROR).json({ error: 'Failed to get user' })
  }
}

/* I got this error: 

  npm test

> basicapi@1.0.0 test
> jest

 FAIL  src/tests/authController.test.ts
  ● Test suite failed to run

    Jest encountered an unexpected token

    Jest failed to parse a file. This happens e.g. when your code or its dependencies use non-standard JavaScript syntax, or when Jest is not configured to support such syntax.

    Out of the box Jest supports Babel, which will be used to transform your files into valid JS based on your Babel configuration.

    By default "node_modules" folder is ignored by transformers.

    Here's what you can do:
     • If you are trying to use ECMAScript Modules, see https://jestjs.io/docs/ecmascript-modules for how to enable it.
     • If you are trying to use TypeScript, see https://jestjs.io/docs/getting-started#using-typescript
     • To have some of your "node_modules" files transformed, you can specify a custom "transformIgnorePatterns" in your config.
     • If you need a custom transformation, specify a "transform" option in your config.
     • If you simply want to mock your non-JS modules (e.g. binary assets) you can stub them out with the "moduleNameMapper" config option.

    You'll find more details and examples of these config options in the docs:
    https://jestjs.io/docs/configuration
    For information about custom transformations, see:
    https://jestjs.io/docs/code-transformation

    Details:

    SyntaxError: /home/memz/Repos/Test-FullStack/Back/src/tests/authController.test.ts: Missing semicolon. (8:13)

       6 |
       7 | describe('Unit Test: registerUser Controller', () => {
    >  8 |   let mockReq: any
         |              ^
       9 |   let mockRes: any
      10 |   let next: any = jest.fn()
      11 |

      at constructor (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at Parser.toParseError [as raise] (node_modules/@babel/parser/src/tokenizer/index.ts:1504:19)
      at Parser.raise [as semicolon] (node_modules/@babel/parser/src/parser/util.ts:149:10)
      at Parser.semicolon [as parseVarStatement] (node_modules/@babel/parser/src/parser/statement.ts:1252:10)
      at Parser.parseVarStatement [as parseStatementContent] (node_modules/@babel/parser/src/parser/statement.ts:612:21)
      at Parser.parseStatementContent [as parseStatementLike] (node_modules/@babel/parser/src/parser/statement.ts:482:17)
      at Parser.parseStatementLike [as parseStatementListItem] (node_modules/@babel/parser/src/parser/statement.ts:431:17)
      at Parser.parseStatementListItem [as parseBlockOrModuleBlockBody] (node_modules/@babel/parser/src/parser/statement.ts:1444:16)
      at Parser.parseBlockOrModuleBlockBody [as parseBlockBody] (node_modules/@babel/parser/src/parser/statement.ts:1417:10)
      at Parser.parseBlockBody [as parseBlock] (node_modules/@babel/parser/src/parser/statement.ts:1385:10)
      at Parser.parseBlock [as parseFunctionBody] (node_modules/@babel/parser/src/parser/expression.ts:2618:24)
      at Parser.parseFunctionBody [as parseArrowExpression] (node_modules/@babel/parser/src/parser/expression.ts:2559:10)
      at Parser.parseArrowExpression [as parseParenAndDistinguishExpression] (node_modules/@babel/parser/src/parser/expression.ts:1847:12)
      at Parser.parseParenAndDistinguishExpression [as parseExprAtom] (node_modules/@babel/parser/src/parser/expression.ts:1170:21)
      at Parser.parseExprAtom [as parseExprSubscripts] (node_modules/@babel/parser/src/parser/expression.ts:742:23)
      at Parser.parseExprSubscripts [as parseUpdate] (node_modules/@babel/parser/src/parser/expression.ts:721:21)
      at Parser.parseUpdate [as parseMaybeUnary] (node_modules/@babel/parser/src/parser/expression.ts:683:23)
      at Parser.parseMaybeUnary [as parseMaybeUnaryOrPrivate] (node_modules/@babel/parser/src/parser/expression.ts:417:14)
      at Parser.parseMaybeUnaryOrPrivate [as parseExprOps] (node_modules/@babel/parser/src/parser/expression.ts:429:23)
      at Parser.parseExprOps [as parseMaybeConditional] (node_modules/@babel/parser/src/parser/expression.ts:384:23)
      at Parser.parseMaybeConditional [as parseMaybeAssign] (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at Parser.callback [as allowInAnd] (node_modules/@babel/parser/src/parser/expression.ts:3194:12)
      at Parser.allowInAnd [as parseMaybeAssignAllowIn] (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at Parser.parseMaybeAssignAllowIn [as parseMaybeAssignAllowInOrVoidPattern] (node_modules/@babel/parser/src/parser/expression.ts:3308:17)
      at Parser.parseMaybeAssignAllowInOrVoidPattern [as parseExprListItem] (node_modules/@babel/parser/src/parser/expression.ts:2790:18)
      at Parser.parseExprListItem [as parseCallExpressionArguments] (node_modules/@babel/parser/src/parser/expression.ts:1042:14)
      at Parser.parseCallExpressionArguments [as parseCoverCallAndAsyncArrowHead] (node_modules/@babel/parser/src/parser/expression.ts:922:29)
      at Parser.parseCoverCallAndAsyncArrowHead [as parseSubscript] (node_modules/@babel/parser/src/parser/expression.ts:804:19)
      at Parser.parseSubscript [as parseSubscripts] (node_modules/@babel/parser/src/parser/expression.ts:763:19)
      at Parser.parseSubscripts [as parseExprSubscripts] (node_modules/@babel/parser/src/parser/expression.ts:748:17)
      at Parser.parseExprSubscripts [as parseUpdate] (node_modules/@babel/parser/src/parser/expression.ts:721:21)
      at Parser.parseUpdate [as parseMaybeUnary] (node_modules/@babel/parser/src/parser/expression.ts:683:23)
      at Parser.parseMaybeUnary [as parseMaybeUnaryOrPrivate] (node_modules/@babel/parser/src/parser/expression.ts:417:14)
      at Parser.parseMaybeUnaryOrPrivate [as parseExprOps] (node_modules/@babel/parser/src/parser/expression.ts:429:23)
      at Parser.parseExprOps [as parseMaybeConditional] (node_modules/@babel/parser/src/parser/expression.ts:384:23)
      at Parser.parseMaybeConditional [as parseMaybeAssign] (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at Parser.parseMaybeAssign [as parseExpressionBase] (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at Parser.callback [as allowInAnd] (node_modules/@babel/parser/src/parser/expression.ts:3189:16)
      at Parser.allowInAnd [as parseExpression] (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at Parser.parseExpression [as parseStatementContent] (node_modules/@babel/parser/src/parser/statement.ts:688:23)
      at Parser.parseStatementContent [as parseStatementLike] (node_modules/@babel/parser/src/parser/statement.ts:482:17)
      at Parser.parseStatementLike [as parseModuleItem] (node_modules/@babel/parser/src/parser/statement.ts:419:17)
      at Parser.parseModuleItem [as parseBlockOrModuleBlockBody] (node_modules/@babel/parser/src/parser/statement.ts:1443:16)
      at Parser.parseBlockOrModuleBlockBody [as parseBlockBody] (node_modules/@babel/parser/src/parser/statement.ts:1417:10)
      at Parser.parseBlockBody [as parseProgram] (node_modules/@babel/parser/src/parser/statement.ts:229:10)
      at Parser.parseProgram [as parseTopLevel] (node_modules/@babel/parser/src/parser/statement.ts:203:25)
      at Parser.parseTopLevel [as parse] (node_modules/@babel/parser/src/parser/index.ts:83:25)
      at parse (node_modules/@babel/parser/src/index.ts:86:38)
      at parser (node_modules/@babel/core/src/parser/index.ts:29:19)
          at parser.next (<anonymous>)
      at normalizeFile (node_modules/@babel/core/src/transformation/normalize-file.ts:50:24)
          at normalizeFile.next (<anonymous>)
      at run (node_modules/@babel/core/src/transformation/index.ts:41:36)
          at run.next (<anonymous>)
      at transform (node_modules/@babel/core/src/transform.ts:29:20)
          at transform.next (<anonymous>)
      at evaluateSync (node_modules/gensync/index.js:251:28)
      at sync (node_modules/gensync/index.js:89:14)
      at fn (node_modules/@babel/core/src/errors/rewrite-stack-trace.ts:99:14)
      at transformSync (node_modules/@babel/core/src/transform.ts:66:52)
      at ScriptTransformer.transformSource (node_modules/@jest/transform/build/index.js:422:31)
      at ScriptTransformer._transformAndBuildScript (node_modules/@jest/transform/build/index.js:519:40)
      at ScriptTransformer.transform (node_modules/@jest/transform/build/index.js:558:19)
*/
