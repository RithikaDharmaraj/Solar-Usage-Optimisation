from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    company_name = db.Column(db.String(120))
    address = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    scans = db.relationship('Scan', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Scan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    network_range = db.Column(db.String(100), nullable=False)
    scan_type = db.Column(db.String(20), default='standard')  # standard, deep, solar_focused
    status = db.Column(db.String(20), default='pending')  # pending, running, completed, failed
    total_devices = db.Column(db.Integer, default=0)
    vulnerable_devices = db.Column(db.Integer, default=0)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    devices = db.relationship('Device', backref='scan', lazy='dynamic', cascade='all, delete-orphan')
    solar_assessment = db.relationship('SolarAssessment', backref='scan', uselist=False, cascade='all, delete-orphan')

class Device(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey('scan.id'), nullable=False)
    ip_address = db.Column(db.String(15), nullable=False)
    mac_address = db.Column(db.String(17))
    hostname = db.Column(db.String(100))
    device_type = db.Column(db.String(50))  # router, switch, printer, server, iot, solar, etc.
    manufacturer = db.Column(db.String(100))
    os = db.Column(db.String(100))
    firmware_version = db.Column(db.String(50))
    is_vulnerable = db.Column(db.Boolean, default=False)
    is_solar_device = db.Column(db.Boolean, default=False)
    open_ports = db.Column(db.Text)  # JSON string of open ports and services
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    vulnerabilities = db.relationship('Vulnerability', backref='device', lazy='dynamic', cascade='all, delete-orphan')

class Vulnerability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('device.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    severity = db.Column(db.String(20))  # Critical, High, Medium, Low
    cvss_score = db.Column(db.Float)
    cve_id = db.Column(db.String(20))
    affected_component = db.Column(db.String(100))
    remediation = db.Column(db.Text)
    discovered_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='open')  # open, fixed, in_progress, ignored

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    scan_id = db.Column(db.Integer, db.ForeignKey('scan.id'), nullable=False)
    report_type = db.Column(db.String(20), default='full')  # full, executive, vulnerability, solar
    file_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    scan = db.relationship('Scan', backref='reports')

class ThreatIntelligence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    threat_type = db.Column(db.String(50))  # malware, ransomware, exploit, etc.
    severity = db.Column(db.String(20))  # Critical, High, Medium, Low
    cve_id = db.Column(db.String(20))
    published_date = db.Column(db.DateTime, default=datetime.utcnow)
    source = db.Column(db.String(100))
    affected_systems = db.Column(db.Text)
    mitigation = db.Column(db.Text)
    is_relevant_to_solar = db.Column(db.Boolean, default=False)
    is_relevant_to_iot = db.Column(db.Boolean, default=False)

class FirewallRule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    source_ip = db.Column(db.String(100))
    destination_ip = db.Column(db.String(100))
    protocol = db.Column(db.String(10))  # tcp, udp, icmp
    port_range = db.Column(db.String(50))
    action = db.Column(db.String(10))  # allow, deny
    priority = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

class SolarAssessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scan_id = db.Column(db.Integer, db.ForeignKey('scan.id'), nullable=False)
    security_score = db.Column(db.Integer)  # 0-100
    inverter_vulnerabilities = db.Column(db.Text)  # JSON string
    monitoring_system_vulnerabilities = db.Column(db.Text)  # JSON string
    communication_protocol_issues = db.Column(db.Text)  # JSON string
    network_isolation_score = db.Column(db.Integer)  # 0-10
    authentication_strength = db.Column(db.String(20))  # Weak, Moderate, Strong
    encryption_status = db.Column(db.String(20))  # Weak, Moderate, Strong
    firmware_status = db.Column(db.String(20))  # Outdated, Up-to-date
    recommendations = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
