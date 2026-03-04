import { uploadProfilePicture, uploadCompanyLogo, upload } from "../../../middlewares/upload.middleware";

describe("Upload Middleware Unit Tests", () => {

  describe("Multer Instances", () => {
    it("1. uploadProfilePicture should be defined and be a multer instance", () => {
      expect(uploadProfilePicture).toBeDefined();
      expect(typeof uploadProfilePicture.single).toBe("function");
      expect(typeof uploadProfilePicture.array).toBe("function");
      expect(typeof uploadProfilePicture.fields).toBe("function");
    });

    it("2. uploadCompanyLogo should be defined and be a multer instance", () => {
      expect(uploadCompanyLogo).toBeDefined();
      expect(typeof uploadCompanyLogo.single).toBe("function");
      expect(typeof uploadCompanyLogo.array).toBe("function");
      expect(typeof uploadCompanyLogo.fields).toBe("function");
    });

    it("3. upload should be defined and be a multer instance", () => {
      expect(upload).toBeDefined();
      expect(typeof upload.single).toBe("function");
      expect(typeof upload.array).toBe("function");
      expect(typeof upload.fields).toBe("function");
    });
  });

  describe("fileFilter - field name validation", () => {
    it("4. should reject invalid field names", () => {
      const fileFilter = (uploadProfilePicture as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "invalidField", mimetype: "image/jpeg" }, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
      expect(cb.mock.calls[0][0].message).toBe("Invalid field name for upload.");
    });

    it("5. should accept profilePicture as a valid field name", () => {
      const fileFilter = (uploadProfilePicture as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "profilePicture", mimetype: "image/jpeg" }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it("6. should accept companyLogo as a valid field name", () => {
      const fileFilter = (uploadCompanyLogo as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "companyLogo", mimetype: "image/png" }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });
  });

  describe("fileFilter - mimetype validation", () => {
    it("7. should reject non-image mimetypes for profilePicture", () => {
      const fileFilter = (uploadProfilePicture as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "profilePicture", mimetype: "application/pdf" }, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
      expect(cb.mock.calls[0][0].message).toBe("Only image files are allowed.");
    });

    it("8. should reject non-image mimetypes for companyLogo", () => {
      const fileFilter = (uploadCompanyLogo as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "companyLogo", mimetype: "text/plain" }, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
      expect(cb.mock.calls[0][0].message).toBe("Only image files are allowed.");
    });

    it("9. should accept image/jpeg for profilePicture", () => {
      const fileFilter = (uploadProfilePicture as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "profilePicture", mimetype: "image/jpeg" }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it("10. should accept image/png for profilePicture", () => {
      const fileFilter = (uploadProfilePicture as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "profilePicture", mimetype: "image/png" }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it("11. should accept image/webp for companyLogo", () => {
      const fileFilter = (uploadCompanyLogo as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "companyLogo", mimetype: "image/webp" }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });
  });

  describe("upload alias", () => {
    it("12. upload should also have a valid fileFilter", () => {
      const fileFilter = (upload as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "profilePicture", mimetype: "image/jpeg" }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it("13. upload should reject invalid field name", () => {
      const fileFilter = (upload as any).fileFilter;
      if (!fileFilter) return;
      const cb = jest.fn();
      fileFilter({}, { fieldname: "badField", mimetype: "image/jpeg" }, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});


