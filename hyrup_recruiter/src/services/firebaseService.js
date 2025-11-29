import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a company logo to Firebase Storage
 * @param {File} file - The file object to upload
 * @param {string} companyName - The name of the company (used for file naming)
 * @returns {Promise<string>} - The download URL of the uploaded logo
 */
export const uploadCompanyLogo = async (file, companyName) => {
    if (!file) return null;

    try {
        // Sanitize company name for file path
        const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const timestamp = Date.now();
        const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');

        // Create a unique path: company-logos/company_name_timestamp_filename
        const storagePath = `company-logos/${sanitizedCompanyName}_${timestamp}_${fileName}`;
        const storageRef = ref(storage, storagePath);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading company logo:', error);
        throw new Error('Failed to upload company logo. Please try again.');
    }
};
