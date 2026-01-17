from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="vauntico-sdk",
    version="1.0.0",
    author="Vauntico Team",
    author_email="api-support@vauntico.com",
    description="Official Python client SDK for the Vauntico Trust Score Dashboard API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/vauntico/python-sdk",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP",
    ],
    python_requires=">=3.7",
    install_requires=[
        "httpx>=0.24.0",
        "pydantic>=2.0.0",
        "typing-extensions>=4.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "isort>=5.12.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
        ],
    },
    keywords=[
        "vauntico",
        "trust-score",
        "api",
        "sdk",
        "python",
        "dashboard",
        "async",
        "http",
    ],
    project_urls={
        "Bug Reports": "https://github.com/vauntico/python-sdk/issues",
        "Source": "https://github.com/vauntico/python-sdk",
        "Documentation": "https://docs.vauntico.com/api",
    },
)
