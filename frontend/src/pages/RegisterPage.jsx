import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">📚</span>
        <h1 className="text-3xl font-bold text-gray-900">Join BookWorm</h1>
        <p className="text-gray-500 mt-2">Create your account and start reading</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <RegisterForm />
      </div>
    </div>
  </div>
);

export default RegisterPage;
