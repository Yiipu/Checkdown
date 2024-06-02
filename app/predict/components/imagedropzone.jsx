"use client";

import styles from "./styles.module.css";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { predict } from "@/app/actions";

export default function ImageDropzone() {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setLoading(true);

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    predict(formData)
      .then((res) => {
        setMessage(res);
      })
      .catch((error) => {
        setLoading(false);
        alert(error);
      })
      .finally(() => {
        setLoading(false);
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
      <div className={styles.result}>
        {loading
          ? "Loading..."
          : !message
            ? ""
            : message.message
              ? `Predict: ${message.message}`
              : message.error
                ? `Error: ${message.error}`
                : ""}
      </div>
    </div>
  );
}
