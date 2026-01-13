import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { Form } from '../../../shared/types';

export async function generateOrUpdateExcelFile(
  form: Form & { fields: any[] },
  newSubmissions: any[],
  user: { id: number; email: string; role: string; createdAt: Date; updatedAt: Date }
) {
  try {
    console.log('🔄 Début de la génération Excel pour le formulaire:', form.name);
    console.log('📊 Nombre de nouvelles soumissions:', newSubmissions.length);
    console.log('👤 Utilisateur:', user.email);

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Création du dossier uploads');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Vérifier s'il existe déjà un fichier Excel pour ce formulaire et cet utilisateur
    console.log('🔍 Recherche d\'un fichier Excel existant...');
    const existingExcelFile = await prisma.excelFile.findFirst({
      where: {
        formId: form.id,
        ownerId: user.id
      },
      orderBy: { version: 'desc' }
    });

    console.log('📄 Fichier existant trouvé:', existingExcelFile ? `v${existingExcelFile.version}` : 'Aucun');

    let workbook = new ExcelJS.Workbook();
    let worksheet;
    let existingData: any[] = [];
    let newVersion = 1;

    if (existingExcelFile && fs.existsSync(path.join(process.cwd(), existingExcelFile.filePath))) {
      console.log('📖 Chargement du fichier Excel existant...');
      // Charger le fichier Excel existant
      try {
        await workbook.xlsx.readFile(path.join(process.cwd(), existingExcelFile.filePath));
        worksheet = workbook.getWorksheet(form.name) || workbook.getWorksheet(1);
        newVersion = existingExcelFile.version + 1;

        // Extraire les données existantes (ignorer la ligne d'en-tête)
        if (worksheet) {
          console.log('📋 Extraction des données existantes...');
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Ignorer l'en-tête
              const rowData: Record<string, any> = {};
              form.fields.forEach((field, index) => {
                const cellValue = row.getCell(index + 1).value;
                rowData[`field_${field.id}`] = cellValue || '';
              });
              existingData.push(rowData);
            }
          });
          console.log('📊 Données existantes extraites:', existingData.length, 'lignes');
        }
      } catch (error) {
        console.log('⚠️ Erreur lors de la lecture du fichier existant, création d\'un nouveau fichier');
        console.error('Détails de l\'erreur:', error);
        workbook = new ExcelJS.Workbook();
      }
    } else {
      console.log('📄 Aucun fichier existant, création d\'un nouveau fichier');
    }

    // Créer ou recréer la feuille de calcul
    console.log('📋 Création de la nouvelle feuille de calcul...');
    if (worksheet) {
      workbook.removeWorksheet(worksheet.id);
    }
    worksheet = workbook.addWorksheet(form.name);

    // Préparer les colonnes dynamiquement basées sur les champs du formulaire
    console.log('📊 Configuration des colonnes...');
    const columns: any[] = [];
    form.fields.forEach(field => {
      columns.push({
        header: field.label,
        key: `field_${field.id}`,
        width: 25
      });
    });

    // Configurer les colonnes
    worksheet.columns = columns;
    console.log('✅ Colonnes configurées:', columns.length);

    // Styliser l'en-tête (première ligne)
    console.log('🎨 Stylisation de l\'en-tête...');
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Ajouter des bordures à l'en-tête
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      };
    });

    // Ajouter les NOUVELLES données en PREMIER (au-dessus des anciennes)
    newSubmissions.forEach((submission) => {
      const rowData: Record<string, any> = {};
      form.fields.forEach(field => {
        const submissionData = submission.data as Record<string, string>;
        const value = submissionData ? submissionData[field.id.toString()] || '' : '';
        rowData[`field_${field.id}`] = value;
      });

      const dataRow = worksheet.addRow(rowData);
      
      // Styliser la ligne de données (nouvelles données en vert clair)
      dataRow.font = { size: 10 };
      dataRow.alignment = { vertical: 'middle', horizontal: 'left' };
      dataRow.height = 20;
      dataRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F5E8' } // Vert très clair pour les nouvelles données
      };

      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Ajouter les données existantes APRÈS les nouvelles
    existingData.forEach((rowData) => {
      const dataRow = worksheet.addRow(rowData);
      
      // Styliser la ligne de données (données existantes en blanc)
      dataRow.font = { size: 10 };
      dataRow.alignment = { vertical: 'middle', horizontal: 'left' };
      dataRow.height = 20;

      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Ajuster automatiquement la largeur des colonnes
    worksheet.columns.forEach(column => {
      if (column.width && column.width < 15) {
        column.width = 15;
      } else if (!column.width) {
        column.width = 20;
      }
    });

    // Générer le nom de fichier avec version
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const totalEntries = newSubmissions.length + existingData.length;
    const fileName = `${form.name}_v${newVersion}_${totalEntries}_entries_${timestamp}.xlsx`;
    const filePath = path.join('uploads', fileName);
    const fullPath = path.join(process.cwd(), filePath);

    // Sauvegarder le fichier
    await workbook.xlsx.writeFile(fullPath);

    // Enregistrer en base de données
    const excelFile = await prisma.excelFile.create({
      data: {
        fileName,
        filePath,
        ownerId: user.id,
        formId: form.id,
        version: newVersion,
        submissionsCount: totalEntries
      }
    });

    return {
      excelFile,
      isNewVersion: existingExcelFile !== null,
      previousVersion: existingExcelFile?.version || 0,
      newEntriesCount: newSubmissions.length,
      totalEntriesCount: totalEntries
    };
  } catch (error) {
    console.error('Erreur lors de la génération du fichier Excel:', error);
    throw error;
  }
}