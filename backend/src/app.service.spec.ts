import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
  });

  describe('getHealth', () => {
    it('should return { status: "ok" }', () => {
      expect(appService.getHealth()).toEqual({ status: 'ok' });
    });
  });
});
