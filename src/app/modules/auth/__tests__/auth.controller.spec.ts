import { errAsync, okAsync } from 'neverthrow'
import { mocked } from 'ts-jest/utils'

import MailService from 'src/app/services/mail/mail.service'
import { HashingError } from 'src/app/utils/hash'
import { AgencyDocument, IPopulatedUser } from 'src/types'

import expressHandler from 'tests/unit/backend/helpers/jest-express'

import { MailSendError } from '../../../services/mail/mail.errors'
import { DatabaseError } from '../../core/core.errors'
import * as UserService from '../../user/user.service'
import * as AuthController from '../auth.controller'
import { InvalidDomainError, InvalidOtpError } from '../auth.errors'
import * as AuthService from '../auth.service'

const VALID_EMAIL = 'test@example.com'

// Mock services invoked by AuthController
jest.mock('../auth.service')
jest.mock('../../user/user.service')
jest.mock('src/app/services/mail/mail.service')
const MockAuthService = mocked(AuthService)
const MockMailService = mocked(MailService)
const MockUserService = mocked(UserService)

describe('auth.controller', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('handleCheckUser', () => {
    const MOCK_REQ = expressHandler.mockRequest({
      body: { email: 'test@example.com' },
    })

    it('should return 200 when domain is valid', async () => {
      // Arrange
      const mockRes = expressHandler.mockResponse()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        okAsync(<AgencyDocument>{}),
      )

      // Act
      await AuthController.handleCheckUser(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.sendStatus).toBeCalledWith(200)
    })

    it('should return 401 when retrieving agency returns an InvalidDomainError', async () => {
      // Arrange
      const expectedError = new InvalidDomainError()
      const mockRes = expressHandler.mockResponse()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        errAsync(expectedError),
      )

      // Act
      await AuthController.handleCheckUser(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(401)
      expect(mockRes.json).toBeCalledWith(expectedError.message)
    })
  })

  describe('handleLoginSendOtp', () => {
    const MOCK_OTP = '123456'
    const MOCK_REQ = expressHandler.mockRequest({
      body: { email: VALID_EMAIL },
    })

    it('should return 200 when login OTP is generated and sent to recipient successfully', async () => {
      // Arrange
      const mockRes = expressHandler.mockResponse()
      // Mock AuthService and MailService to return without errors
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        okAsync(<AgencyDocument>{}),
      )
      MockAuthService.createLoginOtp.mockReturnValueOnce(okAsync(MOCK_OTP))
      MockMailService.sendLoginOtp.mockReturnValueOnce(okAsync(true))

      // Act
      await AuthController.handleLoginSendOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(200)
      expect(mockRes.json).toBeCalledWith(`OTP sent to ${VALID_EMAIL}`)
      // Services should have been invoked.
      expect(MockAuthService.createLoginOtp).toHaveBeenCalledTimes(1)
      expect(MockMailService.sendLoginOtp).toHaveBeenCalledTimes(1)
    })

    it('should return 401 when retrieving agency returns InvalidDomainError', async () => {
      // Arrange
      const expectedError = new InvalidDomainError()
      const mockRes = expressHandler.mockResponse()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        errAsync(expectedError),
      )

      // Act
      await AuthController.handleLoginSendOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(401)
      expect(mockRes.json).toBeCalledWith({ message: expectedError.message })
    })

    it('should return 500 when there is an error generating login OTP', async () => {
      // Arrange
      const mockRes = expressHandler.mockResponse()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        okAsync(<AgencyDocument>{}),
      )
      // Mock createLoginOtp failure
      MockAuthService.createLoginOtp.mockReturnValueOnce(
        errAsync(new DatabaseError('otp creation error')),
      )

      // Act
      await AuthController.handleLoginSendOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(500)
      expect(mockRes.json).toBeCalledWith({
        message:
          'Failed to send login OTP. Please try again later and if the problem persists, contact us.',
      })
      // Sending login OTP should not have been called.
      expect(MockAuthService.createLoginOtp).toHaveBeenCalledTimes(1)
      expect(MockMailService.sendLoginOtp).not.toHaveBeenCalled()
    })

    it('should return 500 when there is an error sending login OTP', async () => {
      // Arrange
      const mockRes = expressHandler.mockResponse()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        okAsync(<AgencyDocument>{}),
      )
      // Mock createLoginOtp success but sendLoginOtp failure.
      MockAuthService.createLoginOtp.mockReturnValueOnce(okAsync(MOCK_OTP))
      MockMailService.sendLoginOtp.mockReturnValueOnce(
        errAsync(new MailSendError('send error')),
      )

      // Act
      await AuthController.handleLoginSendOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(500)
      expect(mockRes.json).toBeCalledWith({
        message:
          'Failed to send login OTP. Please try again later and if the problem persists, contact us.',
      })
      // Services should have been invoked.
      expect(MockAuthService.createLoginOtp).toHaveBeenCalledTimes(1)
      expect(MockMailService.sendLoginOtp).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleLoginVerifyOtp', () => {
    const MOCK_OTP = '123456'
    const MOCK_REQ = expressHandler.mockRequest({
      body: { email: VALID_EMAIL, otp: MOCK_OTP },
    })
    const MOCK_AGENCY = { id: 'mock agency id' } as AgencyDocument

    it('should return 200 with the user when verification succeeds', async () => {
      // Arrange
      // Mock bare minimum mongo documents.
      const mockUser = {
        toObject: () => ({ id: 'imagine this is a user document from the db' }),
      } as IPopulatedUser
      const mockRes = expressHandler.mockResponse()

      // Mock all service success.
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        okAsync(MOCK_AGENCY),
      )
      MockAuthService.verifyLoginOtp.mockReturnValueOnce(okAsync(true))
      MockUserService.retrieveUser.mockReturnValueOnce(okAsync(mockUser))

      // Act
      await AuthController.handleLoginVerifyOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(200)
      expect(mockRes.json).toBeCalledWith(mockUser)
    })

    it('should return 401 when retrieving agency returns InvalidDomainError', async () => {
      // Arrange
      const expectedError = new InvalidDomainError()
      const mockRes = expressHandler.mockResponse()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        errAsync(expectedError),
      )

      // Act
      await AuthController.handleLoginVerifyOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(401)
      expect(mockRes.json).toBeCalledWith(expectedError.message)
    })

    it('should return 422 when verifying login OTP returns an InvalidOtpError', async () => {
      // Arrange
      const mockRes = expressHandler.mockResponse()
      const expectedInvalidOtpError = new InvalidOtpError()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        okAsync(MOCK_AGENCY),
      )
      // Mock error from verifyLoginOtp.
      MockAuthService.verifyLoginOtp.mockReturnValueOnce(
        errAsync(expectedInvalidOtpError),
      )

      // Act
      await AuthController.handleLoginVerifyOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(422)
      expect(mockRes.json).toBeCalledWith(expectedInvalidOtpError.message)
      // Check that the correct services have been called or not called.
      expect(MockAuthService.verifyLoginOtp).toHaveBeenCalledTimes(1)
      expect(MockUserService.retrieveUser).not.toHaveBeenCalled()
    })

    it('should return 500 when verifying login OTP returns a non-InvalidOtpError', async () => {
      // Arrange
      const mockRes = expressHandler.mockResponse()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        okAsync(MOCK_AGENCY),
      )
      // Mock generic error from verifyLoginOtp.
      MockAuthService.verifyLoginOtp.mockReturnValueOnce(
        errAsync(new HashingError()),
      )

      // Act
      await AuthController.handleLoginVerifyOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(500)
      expect(mockRes.json).toBeCalledWith(
        expect.stringContaining('Failed to process OTP.'),
      )
      // Check that the correct services have been called or not called.
      expect(MockAuthService.verifyLoginOtp).toHaveBeenCalledTimes(1)
      expect(MockUserService.retrieveUser).not.toHaveBeenCalled()
    })

    it('should return 500 when an error is returned while upserting user', async () => {
      // Arrange
      const mockRes = expressHandler.mockResponse()
      MockAuthService.validateEmailDomain.mockReturnValueOnce(
        okAsync(MOCK_AGENCY),
      )
      MockAuthService.verifyLoginOtp.mockReturnValueOnce(okAsync(true))
      MockUserService.retrieveUser.mockReturnValueOnce(
        errAsync(new DatabaseError()),
      )

      // Act
      await AuthController.handleLoginVerifyOtp(MOCK_REQ, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(500)
      expect(mockRes.json).toBeCalledWith(
        // Use stringContaining here due to dynamic text and out of test scope.
        expect.stringContaining('Failed to process OTP.'),
      )
      // Check that the correct services have been called or not called.
      expect(MockAuthService.verifyLoginOtp).toHaveBeenCalledTimes(1)
      expect(MockUserService.retrieveUser).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleSignout', () => {
    it('should return 200 when session is successfully destroyed', async () => {
      // Arrange
      const mockDestroy = jest.fn().mockImplementation((fn) => fn(false))
      const mockClearCookie = jest.fn()
      const mockReq = expressHandler.mockRequest({
        session: {
          destroy: mockDestroy,
        },
      })
      const mockRes = expressHandler.mockResponse({
        clearCookie: mockClearCookie,
      })

      // Act
      await AuthController.handleSignout(mockReq, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(200)
      expect(mockRes.json).toBeCalledWith({ message: 'Sign out successful' })
      expect(mockClearCookie).toBeCalledTimes(1)
      expect(mockDestroy).toBeCalledTimes(1)
    })

    it('should return 400 when session does not exist in request', async () => {
      // Arrange
      const mockReqWithoutSession = expressHandler.mockRequest()
      const mockRes = expressHandler.mockResponse()

      // Act
      await AuthController.handleSignout(
        mockReqWithoutSession,
        mockRes,
        jest.fn(),
      )

      // Assert
      expect(mockRes.sendStatus).toBeCalledWith(400)
    })

    it('should return 500 when error is returned when destroying session', async () => {
      // Arrange
      const mockDestroyWithErr = jest
        .fn()
        .mockImplementation((fn) => fn(new Error('some error')))
      const mockClearCookie = jest.fn()
      const mockReq = expressHandler.mockRequest({
        session: {
          destroy: mockDestroyWithErr,
        },
      })
      const mockRes = expressHandler.mockResponse({
        clearCookie: mockClearCookie,
      })

      // Act
      await AuthController.handleSignout(mockReq, mockRes, jest.fn())

      // Assert
      expect(mockRes.status).toBeCalledWith(500)
      expect(mockRes.json).toBeCalledWith({ message: 'Sign out failed' })
      expect(mockDestroyWithErr).toBeCalledTimes(1)
      expect(mockClearCookie).not.toBeCalled()
    })
  })
})
