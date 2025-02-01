// /src/Quill.tsx
import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Box, Button, Typography } from '@mui/material';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

const Quill: React.FC = () => {
  const [value, setValue] = useState<string>('');
  const quillRef = useRef<ReactQuill>(null);

  const handleChange = (content: string) => {
    setValue(content);
  };

  const handleSave = () => {
    console.log('Saved Content:', value);
    alert('Content saved!');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        alert('Content copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const pastedData = clipboardData.getData('text/html') || clipboardData.getData('text');

    const range = quillRef.current?.getEditor().getSelection();
    if (range) {
      quillRef.current?.getEditor().dangerouslyPasteHTML(range.index, pastedData);
    }
  };

  return (
    <Box width="100%" mx="auto" mt={4}>
      <Typography variant="h5" gutterBottom>
        React-Quill Editor
      </Typography>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        style={{ height: '300px', marginBottom: '20px' }}
        onPaste={handlePaste}
      />
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save
      </Button>
      <Button variant="contained" color="secondary" onClick={handleCopyToClipboard} style={{ marginLeft: '10px' }}>
        Copy to Clipboard
      </Button>
    </Box>
  );
};

export default Quill;