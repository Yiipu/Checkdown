"use client";

import styles from "./styles.module.css";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { predict } from "@/app/actions";

export default function ImageDropzone() {
  const [message, setMessage] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    predict(formData)
      .then((message) => {
        setMessage(message);
      })
      .catch((error) => {
        alert(error);
      });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className={styles.dropzone}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className={styles.box}>
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag and drop some files here, or click to select files</p>
          )}
        </div>
      </div>
      {message && (
        <div className={styles.result}>Predict: {message.message}</div>
      )}
    </div>
  );
}
