import sys
import requests
from PyQt5.QtWidgets import (
    QApplication, QWidget, QPushButton, QLabel,
    QFileDialog, QVBoxLayout, QMessageBox
)
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure


API_UPLOAD = "http://127.0.0.1:8000/api/upload/"


class App(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Equipment Visualizer (Desktop)")
        self.setGeometry(100, 100, 600, 600)

        self.layout = QVBoxLayout()

        self.upload_btn = QPushButton("Upload CSV")
        self.upload_btn.clicked.connect(self.upload_csv)

        self.result_label = QLabel("Upload a CSV to see results")

        self.figure = Figure()
        self.canvas = FigureCanvas(self.figure)

        self.layout.addWidget(self.upload_btn)
        self.layout.addWidget(self.result_label)
        self.layout.addWidget(self.canvas)

        self.setLayout(self.layout)

    def upload_csv(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Select CSV File", "", "CSV Files (*.csv)"
        )

        if not file_path:
            return

        try:
            with open(file_path, "rb") as f:
                response = requests.post(API_UPLOAD, files={"file": f})

            if response.status_code != 200:
                QMessageBox.critical(self, "Error", "Upload failed")
                return

            data = response.json()
            self.show_summary(data)
            self.show_chart(data["type_distribution"])

        except Exception as e:
            QMessageBox.critical(self, "Error", str(e))

    def show_summary(self, data):
        text = (
            f"Total Equipment: {data['total_equipment']}\n"
            f"Avg Flowrate: {data['avg_flowrate']}\n"
            f"Avg Pressure: {data['avg_pressure']}\n"
            f"Avg Temperature: {data['avg_temperature']}"
        )
        self.result_label.setText(text)

    def show_chart(self, dist):
        self.figure.clear()
        ax = self.figure.add_subplot(111)

        labels = list(dist.keys())
        values = list(dist.values())

        ax.bar(labels, values)
        ax.set_title("Equipment Type Distribution")

        self.canvas.draw()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = App()
    window.show()
    sys.exit(app.exec_())
