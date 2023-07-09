const fs = require("fs");
const path = require("path");
const uploadConfig = require("../configs/upload");

class DiskStorage{


  async saveFile(file){
    const fileName = file.filename; // extrair o nome do arquivo do objeto do arquivo
    await fs.promises.rename(
      path.resolve(uploadConfig.TMP_FOLDER, fileName),
      path.resolve(uploadConfig.UPLOADS_FOLDER, fileName)
    );
    return fileName;
  }

  async deleteFile(file){
    const filePath = path.resolve(uploadConfig.UPLOADS_FOLDER, file);
    try {
      await fs.promises.stat(filePath);
    }catch{
      return;
    }

    await fs.promises.unlink(filePath);

  }

}

module.exports = DiskStorage;