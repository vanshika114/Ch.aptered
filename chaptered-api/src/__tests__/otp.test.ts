import OTP from '../models/otp-model';

describe('OTP SQLite flow', () => {
  beforeEach(async () => {
    await OTP.deleteMany({ email: 'otp-test@example.com', isVerified: 0 });
  });

  it('creates and finds the newest active OTP record for an email', async () => {
    const email = 'otp-test@example.com';

    const firstExpiresAt = new Date(Date.now() + 60 * 1000);
    const firstOtp = await OTP.createOTP(email, 'first-hash', firstExpiresAt);

    const secondExpiresAt = new Date(Date.now() + 120 * 1000);
    const secondOtp = await OTP.createOTP(email, 'second-hash', secondExpiresAt);

    expect(secondOtp.email).toBe(email);
    expect(secondOtp.otpHash).toBe('second-hash');

    const active = await OTP.findActiveOTP(email);
    expect(active).not.toBeNull();
    expect(active?._id).toBe(secondOtp._id);
    expect(active?.otpHash).toBe('second-hash');

    const recentCount = await OTP.countDocuments({
      email,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });
    expect(recentCount).toBeGreaterThan(0);

    const record = await OTP.findById(secondOtp._id);
    expect(record).not.toBeNull();
    expect(typeof record.incrementAttempts).toBe('function');

    const attempts = await record.incrementAttempts();
    expect(attempts).toBe(1);
    expect(record.attempts).toBe(1);
  });
});
