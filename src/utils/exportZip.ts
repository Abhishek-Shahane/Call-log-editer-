import JSZip from 'jszip';
import { ALL_ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add all files directly at the archive root so GitHub Actions finds build.gradle.kts and .github/workflows/build-apk.yml at repo root
  for (const file of ALL_ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  // Add standard .gitignore
  zip.file(
    '.gitignore',
    `*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
debug.keystore
`
  );

  // Generate blob and trigger browser download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CallLogInjector-Android-Studio-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
