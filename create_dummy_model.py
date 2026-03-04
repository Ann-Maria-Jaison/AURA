import os
import cv2
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Flatten, Conv2D, MaxPooling2D

def get_image_size():
    # Try to read the mock image created by mock_setup.py
    img = cv2.imread('gestures/0/0.jpg', 0)
    if img is None:
        return (50, 50)
    return img.shape

def create_dummy_model():
    image_x, image_y = get_image_size()
    num_of_classes = 3 # mock_setup.py creates 0, 1, 2
    
    model = Sequential()
    model.add(Conv2D(16, (2,2), input_shape=(image_x, image_y, 1), activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2), padding='same'))
    model.add(Conv2D(32, (3,3), activation='relu'))
    model.add(MaxPooling2D(pool_size=(3, 3), strides=(3, 3), padding='same'))
    model.add(Conv2D(64, (5,5), activation='relu'))
    model.add(MaxPooling2D(pool_size=(5, 5), strides=(5, 5), padding='same'))
    model.add(Flatten())
    model.add(Dense(128, activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(num_of_classes, activation='softmax'))
    
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    model.save('cnn_model_keras2.h5')
    print("Dummy model 'cnn_model_keras2.h5' created.")

if __name__ == "__main__":
    create_dummy_model()
