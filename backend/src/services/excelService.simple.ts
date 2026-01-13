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

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Création du dossier uploads');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Vérifier s'il existe déjà un fichier Excel pour ce formulaire et cet utilisateur
    const existingExcelFile = await prisma.excelFile.findFirst({
      where: {
        formId: form.id,
        ownerId: user.id
      },
      orderBy: { version: 'desc' }
    });

    let newVersion = existingExcelFile ? existingExcelFile.version + 1 : 1;
    console.log('📄 Version du fichier:', newVersion);

    // Récupérer TOUTES les soumissions existantes pour ce formulaire et cet utilisateur
    const allSubmissions = await prisma.formSubmission.findMany({
      where: {
        formId: form.id,
        submitterId: user.id
      },
      orderBy: { createdAt: 'desc' } // Les plus récentes en premier
    });

    console.log('📊 Total des soumissions à inclure:', allSubmissions.length);

    // Créer le workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(form.name);

    // Préparer les colonnes
    const columns: any[] = [];
    form.fields.forEach(field => {
      columns.push({
        header: field.label,
        key: `field_${field.id}`,
        width: 25
      });
    });

    worksheet.columns = columns;

    // Styliser l'en-tête
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Bordures pour l'en-tête
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thick' },
        left: { style: 'thick' },
        bottom: { style: 'thick' },
        right: { style: 'thick' }
      };
    });

    // Ajouter toutes les données (les plus récentes en premier)
    allSubmissions.forEach((submission, index) => {
      const rowData: Record<string, any> = {};
      form.fields.forEach(field => {
        const submissionData = submission.data as Record<string, string>;
        const value = submissionData ? submissionData[field.id.toString()] || '' : '';
        rowData[`field_${field.id}`] = value;
      });

      const dataRow = worksheet.addRow(rowData);
      
      // Styliser différemment les nouvelles données
      const isNewSubmission = newSubmissions.some(newSub => newSub.id === submission.id);
      
      dataRow.font = { size: 10 };
      dataRow.alignment = { vertical: 'middle', horizontal: 'left' };
      dataRow.height = 20;
      
      if (isNewSubmission) {
        // Nouvelles données en vert clair
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8F5E8' }
        };
      }

      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Ajuster les largeurs de colonnes
    worksheet.columns.forEach(column => {
      if (column.width && column.width < 15) {
        column.width = 15;
      } else if (!column.width) {
        column.width = 20;
      }
    });

    // Générer le nom de fichier
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${form.name}_v${newVersion}_${allSubmissions.length}_entries_${timestamp}.xlsx`;
    const filePath = path.join('uploads', fileName);
    const fullPath = path.join(process.cwd(), filePath);

    console.log('💾 Sauvegarde du fichier:', fileName);
    await workbook.xlsx.writeFile(fullPath);
    console.log('✅ Fichier sauvegardé avec succès');

    // Enregistrer en base de données
    const excelFile = await prisma.excelFile.create({
      data: {
        fileName,
        filePath,
        ownerId: user.id,
        formId: form.id,
        version: newVersion,
        submissionsCount: allSubmissions.length
      }
    });

    console.log('🎉 Génération Excel terminée avec succès !');
    
    return {
      excelFile,
      isNewVersion: existingExcelFile !== null,
      previousVersion: existingExcelFile?.version || 0,
      newEntriesCount: newSubmissions.length,
      totalEntriesCount: allSubmissions.length
    };

  } catch (error) {
    console.error('❌ Erreur lors de la génération du fichier Excel:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}