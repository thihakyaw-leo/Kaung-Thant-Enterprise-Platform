/** Props shared by every settings tab component */
export interface SettingsTabProps {
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}
