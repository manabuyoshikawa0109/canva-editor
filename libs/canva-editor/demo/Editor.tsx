import { CanvaEditor, EditorConfig } from '../src/components/editor';
import React from 'react';
import { data } from './devData';
// import { data } from './sampleData';
import { useState } from 'react';
// Integrate with mock-api: make mock-up
// const editorConfig: EditorConfig = {
//   apis: {
//     url: 'http://localhost:4000/api',
//     searchFonts: '/fonts',
//     searchTemplates: '/master-templates',
//     searchTexts: '/texts',
//     searchImages: '/images',
//     searchShapes: '/shapes',
//     searchFrames: '/frames',
//     templateKeywordSuggestion: '/template-suggestion',
//     textKeywordSuggestion: '/text-suggestion',
//     imageKeywordSuggestion: '/image-suggestion',
//     shapeKeywordSuggestion: '/shape-suggestion',
//     frameKeywordSuggestion: '/frame-suggestion',
//   },
//   editorAssetsUrl: 'http://localhost:4000/editor',
//   imageKeywordSuggestions: 'animal,sport,love,scene,dog,cat,whale',
//   templateKeywordSuggestions:
//     'mother,sale,discount,fashion,model,deal,motivation,quote',
// };

// Integrate with Strapi
const editorConfig: EditorConfig = {
  // logoComponent: <Logo />,
  apis: {
    url: 'http://localhost:4000/api',
    userToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQ5MTM5NzU3LCJleHAiOjE3NTE3MzE3NTd9.doy2N-AmnNtZ6RXdnSS4Oeco6pAf9dZvgBiFrvN7CkU',
    searchFonts: '/search-fonts',
    searchTemplates: '/search-templates',
    searchTexts: '/search-texts',
    searchImages: '/search-images',
    searchShapes: '/search-shapes',
    searchFrames: '/search-frames',
    fetchUserImages: '/your-uploads/get-user-images',
    uploadUserImage: '/your-uploads/upload',
    removeUserImage: '/your-uploads/remove',
    templateKeywordSuggestion: '/template-suggestion',
    textKeywordSuggestion: '/text-suggestion',
    imageKeywordSuggestion: '/image-suggestion',
    shapeKeywordSuggestion: '/shape-suggestion',
    frameKeywordSuggestion: '/frame-suggestion',
  },
  unsplash: {
    accessKey: 'h7hl06iEAXniAqSKnIY9UxVOjt_Bc1SRtp6T0b-T2ow',
    pageSize: 30,
  },
  editorAssetsUrl: 'http://localhost:4000/editor',
  imageKeywordSuggestions: 'animal,sport,love,scene,dog,cat,whale',
  templateKeywordSuggestions:
    'mother,sale,discount,fashion,model,deal,motivation,quote',
  translations: {
    header: {
      file: 'File',
      untitledDesign: 'Untitled Design',
      createNewDesign: 'Create new design',
      resize: 'Resize',
      dimensionsMustBeAtLeast:
        'Dimensions must be greater than 40px and less than 8000px.',
      allChangesSaved: 'All changes saved',
      exportAllPagesAsPNG: 'Export all pages as PNG',
      exportAllPagesAsPDF: 'Export all pages as PDF',
      viewSettings: 'View settings',
      resizePage: 'Resize page',
      import: 'Import',
      download: 'Download',
      preview: 'Preview',
      export: 'Export',
      help: 'Help',
    },
    common: {
      width: 'Width',
      height: 'Height',
      resize: 'Resize',
      loading: 'Loading...',
      page: 'Page',
      save: 'Save',
      addPage: 'Add page',
      notes: 'Notes',
      addPageTitle: 'Add page title',
      zoom: 'Zoom',
      position: 'Position',
      borderWeight: 'Border weight',
      cornerRounding: 'Corner rounding',
      documentColors: 'Document colors',
      defaultColors: 'Default colors',
      solidColors: 'Solid colors',
      gradientColors: 'Gradient colors',
      colors: 'Colors',
      transparency: 'Transparency',
    },
    sidebar: {
      template: 'Template',
      text: 'Text',
      image: 'Image',
      shape: 'Shape',
      frame: 'Frame',
      searchTemplate: 'Search templates',
      searchText: 'Search text',
      searchImage: 'Search images',
      searchShape: 'Search shapes',
      searchFrame: 'Search frames',
      defaultTextStyles: 'Default text styles',
      fontCombination: 'Font combination',
      addAHeading: 'Add a heading',
      addASubheading: 'Add a subheading',
      addALittleBitOfBodyText: 'Add a little bit of body text',
      notesPlaceholder: 'Notes will be shown in Presenter View',
      imageCollection: 'Collection',
      yourUploads: 'Your uploads',
      upload: {
        clickToSelectOrDragAndDropImages: 'Click to select or drag and drop images',
        removeImageMessage: 'Are you sure you want to remove this image?',
        uploading: 'Uploading...',
        failedToRemoveImage: 'Failed to remove image',
        failedToFetchImages: 'Failed to fetch images',
        errorAddingImage: 'Error adding image',
        errorLoadingImage: 'Error loading image',
        noImagesAvailable: 'No images available',
        removing: 'Removing...',
      },
    },
    contextMenu: {
      lock: 'Lock',
      unlock: 'Unlock',
      delete: 'Delete',
      duplicate: 'Duplicate',
      moveUp: 'Move up',
      moveDown: 'Move down',
      bringForward: 'Bring forward',
      sendBackward: 'Send backward',
      group: 'Group',
      ungroup: 'Ungroup',
      sendToBack: 'Send to back',
      bringToFront: 'Bring to front',
      paste: 'Paste',
      setAsBackground: 'Set as background',
      detachImageFromBackground: 'Detach image from background',
      layer: 'Layer',
      showLayers: 'Show layers',
      copy: 'Copy',
      cut: 'Cut',
      undo: 'Undo',
      redo: 'Redo',
      selectAll: 'Select all',
      deselect: 'Deselect',
      align: 'Align',
      alignLeft: 'Align left',
      alignCenter: 'Align center',
      alignRight: 'Align right',
      alignTop: 'Align top',
      alignBottom: 'Align bottom',
      alignMiddle: 'Align middle',
    },
  },
};

const Editor = () => {
  const [saving, setSaving] = useState(false);
  const name = '';
  const handleOnChanges = (changes: any) => {
    console.log('On changes: ', changes);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1e3);
  };

  const handleOnDesignNameChanges = (newName: string) => {
    console.log('On name changes: ' + newName);
    setSaving(true);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1e3);
  };
  const handleOnRemove = () => {
    console.log('remove');
  };

  return (
    <CanvaEditor
      data={{
        name,
        editorConfig: data,
      }}
      config={editorConfig}
      saving={saving}
      onRemove={handleOnRemove}
      onChanges={handleOnChanges}
      onDesignNameChanges={handleOnDesignNameChanges}
    />
  );
};

export default Editor;
